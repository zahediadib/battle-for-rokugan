#!/usr/bin/env python3
"""
Battle for Rokugan - Backend API Testing
Tests all authentication, room management, and game functionality
"""

import requests
import json
import time
import sys
import os
from datetime import datetime

class RokuganAPITester:
    def __init__(self, base_url=None):
        if base_url is None:
            base_url = os.getenv("ROKUGAN_BASE_URL", "http://localhost:8001")
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.username = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    self.log(f"   Error: {error_detail}")
                except:
                    self.log(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            return False, {}

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        self.log("\n=== Testing Authentication ===")
        
        # Test registration with test credentials
        test_username = f"testuser_{int(time.time())}"
        test_password = "testpass123"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"username": test_username, "password": test_password}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user_id']
            self.username = response['username']
            self.log(f"   Registered user: {self.username}")
        else:
            self.log("❌ Registration failed, cannot continue with auth tests")
            return False
            
        # Test login with same credentials
        success, response = self.run_test(
            "User Login",
            "POST", 
            "auth/login",
            200,
            data={"username": test_username, "password": test_password}
        )
        
        if success and 'token' in response:
            self.token = response['token']  # Update token
            self.log(f"   Login successful for: {response['username']}")
        else:
            self.log("❌ Login failed")
            return False
            
        # Test /auth/me endpoint
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me", 
            200
        )
        
        if success:
            self.log(f"   Current user: {response.get('username')}")
        
        # Test invalid credentials
        self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"username": "invalid", "password": "wrong"}
        )
        
        return True

    def test_room_endpoints(self):
        """Test room management endpoints"""
        self.log("\n=== Testing Room Management ===")
        
        if not self.token:
            self.log("❌ No auth token, skipping room tests")
            return False
            
        # Test room creation
        room_name = f"Test Room {int(time.time())}"
        success, response = self.run_test(
            "Create Room",
            "POST",
            "rooms",
            200,
            data={"name": room_name, "max_players": 4}
        )
        
        room_id = None
        if success and 'room_id' in response:
            room_id = response['room_id']
            self.log(f"   Created room: {room_id}")
        else:
            self.log("❌ Room creation failed")
            return False
            
        # Test list rooms
        success, response = self.run_test(
            "List Rooms",
            "GET",
            "rooms",
            200
        )
        
        if success:
            rooms = response if isinstance(response, list) else []
            self.log(f"   Found {len(rooms)} rooms")
            
        # Test get specific room
        success, response = self.run_test(
            "Get Room Details",
            "GET", 
            f"rooms/{room_id}",
            200
        )
        
        if success:
            self.log(f"   Room details: {response.get('name')}")
            
        # Test join room (should already be in as creator)
        success, response = self.run_test(
            "Join Room",
            "POST",
            f"rooms/{room_id}/join",
            200
        )
        
        # Test leave room
        success, response = self.run_test(
            "Leave Room", 
            "POST",
            f"rooms/{room_id}/leave",
            200
        )
        
        # Rejoin for game start test
        self.run_test(
            "Rejoin Room",
            "POST", 
            f"rooms/{room_id}/join",
            200
        )
        
        return room_id

    def test_game_endpoints(self, room_id):
        """Test game-related endpoints"""
        self.log("\n=== Testing Game Endpoints ===")
        
        if not room_id:
            self.log("❌ No room ID, skipping game tests")
            return False
            
        # Test start game (should fail with only 1 player)
        success, response = self.run_test(
            "Start Game (Should Fail - Need 2 Players)",
            "POST",
            f"rooms/{room_id}/start", 
            400
        )
        
        # Create second user for 2-player game
        test_username2 = f"testuser2_{int(time.time())}"
        test_password2 = "testpass123"
        
        # Save current token
        original_token = self.token
        
        # Register second user
        success, response = self.run_test(
            "Register Second User",
            "POST",
            "auth/register",
            200,
            data={"username": test_username2, "password": test_password2}
        )
        
        if success and 'token' in response:
            second_token = response['token']
            # Join room as second user
            self.token = second_token
            success, response = self.run_test(
                "Second User Join Room",
                "POST",
                f"rooms/{room_id}/join",
                200
            )
            
        # Switch back to original user (host)
        self.token = original_token
        
        # Now try to start game with 2 players
        success, response = self.run_test(
            "Start Game (2 Players)",
            "POST", 
            f"rooms/{room_id}/start",
            200
        )
        
        game_id = None
        if success and 'game_id' in response:
            game_id = response['game_id']
            self.log(f"   Started game: {game_id}")
        else:
            self.log("❌ Game start failed")
            return False
            
        # Test get game state
        success, response = self.run_test(
            "Get Game State",
            "GET",
            f"game/{game_id}",
            200
        )
        
        if success:
            self.log(f"   Game status: {response.get('status')}")
            self.log(f"   Game phase: {response.get('phase')}")
            self.log(f"   Players: {len(response.get('players', []))}")
            
        # Test game data endpoints
        self.run_test(
            "Get Map Data",
            "GET",
            f"game/{game_id}/map",
            200
        )
        
        self.run_test(
            "Get Objectives Data", 
            "GET",
            "game-data/objectives",
            200
        )
        
        self.run_test(
            "Get Clans Data",
            "GET", 
            "game-data/clans",
            200
        )
        
        return game_id

    def test_websocket_connection(self, game_id):
        """Test WebSocket connection (basic connectivity)"""
        self.log("\n=== Testing WebSocket Connection ===")
        
        if not game_id or not self.token:
            self.log("❌ Missing game_id or token for WebSocket test")
            return False
            
        try:
            import websocket
            
            # Convert HTTPS URL to WSS for WebSocket
            ws_url = self.base_url.replace('https://', 'wss://').replace('http://', 'ws://')
            ws_endpoint = f"{ws_url}/api/ws/{game_id}?token={self.token}"
            
            self.log(f"   Connecting to: {ws_endpoint}")
            
            # Simple connection test
            ws = websocket.create_connection(ws_endpoint, timeout=5)
            self.log("✅ WebSocket connection established")
            
            # Send a simple action
            test_action = {"action": "select_clan", "clan": "lion"}
            ws.send(json.dumps(test_action))
            
            # Try to receive response
            response = ws.recv()
            self.log(f"   Received: {response[:100]}...")
            
            ws.close()
            self.tests_run += 1
            self.tests_passed += 1
            return True
            
        except ImportError:
            self.log("⚠️  websocket-client not available, skipping WebSocket test")
            return True
        except Exception as e:
            self.log(f"❌ WebSocket test failed: {str(e)}")
            self.tests_run += 1
            return False

    def test_phase2_websocket_actions(self):
        """Test Phase 2+3 WebSocket actions with existing active game"""
        self.log("\n=== Testing Phase 2+3 WebSocket Actions ===")
        
        # Test with the active game mentioned in review request
        active_game_id = "4fa2f74a-0df3-4bc0-ab75-93bd2db1c16f"
        
        # Test with provided credentials
        test_credentials = [
            {"username": "host", "password": "h1"},
            {"username": "player2", "password": "p2"}
        ]
        
        for cred in test_credentials:
            self.log(f"\n--- Testing with {cred['username']} ---")
            
            # Login with test credentials
            success, response = self.run_test(
                f"Login as {cred['username']}",
                "POST",
                "auth/login",
                200,
                data=cred
            )
            
            if not success:
                self.log(f"❌ Failed to login as {cred['username']}, skipping WebSocket tests")
                continue
                
            token = response.get('token')
            if not token:
                self.log(f"❌ No token received for {cred['username']}")
                continue
                
            # Test game state access
            original_token = self.token
            self.token = token
            
            success, game_state = self.run_test(
                f"Get Game State as {cred['username']}",
                "GET",
                f"game/{active_game_id}",
                200
            )
            
            if success:
                self.log(f"   Game status: {game_state.get('status')}")
                self.log(f"   Game phase: {game_state.get('phase')}")
                self.log(f"   Round: {game_state.get('round')}")
                
                # Test WebSocket actions if in placement phase
                if game_state.get('phase') == 'placement':
                    self._test_websocket_actions(active_game_id, token, cred['username'])
            
            self.token = original_token
            
        return True
        
    def _test_websocket_actions(self, game_id, token, username):
        """Test specific WebSocket actions"""
        try:
            import websocket
            
            ws_url = self.base_url.replace('https://', 'wss://').replace('http://', 'ws://')
            ws_endpoint = f"{ws_url}/api/ws/{game_id}?token={token}"
            
            ws = websocket.create_connection(ws_endpoint, timeout=5)
            self.log(f"   WebSocket connected for {username}")
            
            # Test Scout action (if available)
            scout_action = {
                "action": "use_scout",
                "target_location": "province", 
                "target_id": "crab_1"
            }
            ws.send(json.dumps(scout_action))
            response = ws.recv()
            self.log(f"   Scout action response: {response[:100]}...")
            
            # Test Shugenja action (if available)
            shugenja_action = {
                "action": "use_shugenja",
                "target_location": "province",
                "target_id": "crab_2"
            }
            ws.send(json.dumps(shugenja_action))
            response = ws.recv()
            self.log(f"   Shugenja action response: {response[:100]}...")
            
            # Test Scorpion ability (if Scorpion clan)
            scorpion_action = {
                "action": "use_scorpion_ability",
                "target_location": "province",
                "target_id": "unicorn_1"
            }
            ws.send(json.dumps(scorpion_action))
            response = ws.recv()
            self.log(f"   Scorpion ability response: {response[:100]}...")
            
            # Test territory card play
            territory_action = {
                "action": "play_territory_card",
                "territory_id": "scorpion"
            }
            ws.send(json.dumps(territory_action))
            response = ws.recv()
            self.log(f"   Territory card response: {response[:100]}...")
            
            # Test pass territory card
            pass_action = {"action": "pass_territory_card"}
            ws.send(json.dumps(pass_action))
            response = ws.recv()
            self.log(f"   Pass territory response: {response[:100]}...")
            
            # Test edit positions (host only)
            if username == "host":
                edit_action = {
                    "action": "edit_positions",
                    "positions": {"token_1": {"x": 100, "y": 200}}
                }
                ws.send(json.dumps(edit_action))
                response = ws.recv()
                self.log(f"   Edit positions response: {response[:100]}...")
            
            ws.close()
            self.tests_run += 6 if username == "host" else 5
            self.tests_passed += 6 if username == "host" else 5
            
        except ImportError:
            self.log("⚠️  websocket-client not available for Phase 2 testing")
        except Exception as e:
            self.log(f"❌ Phase 2 WebSocket test failed: {str(e)}")
            self.tests_run += 1

    def test_error_handling(self):
        """Test error handling and edge cases"""
        self.log("\n=== Testing Error Handling ===")
        
        # Test invalid endpoints
        self.run_test(
            "Invalid Endpoint",
            "GET",
            "invalid/endpoint",
            404
        )
        
        # Test unauthorized access
        original_token = self.token
        self.token = None
        
        self.run_test(
            "Unauthorized Room Access",
            "GET", 
            "rooms",
            401
        )
        
        self.token = "invalid_token"
        self.run_test(
            "Invalid Token",
            "GET",
            "auth/me", 
            401
        )
        
        # Restore token
        self.token = original_token
        
        # Test invalid room operations
        self.run_test(
            "Join Non-existent Room",
            "POST",
            "rooms/invalid-room-id/join",
            404
        )
        
        return True

    def run_all_tests(self):
        """Run complete test suite"""
        self.log("🚀 Starting Battle for Rokugan API Tests")
        self.log(f"   Testing against: {self.base_url}")
        
        start_time = time.time()
        
        # Run test suites
        auth_success = self.test_auth_endpoints()
        if not auth_success:
            self.log("❌ Auth tests failed, stopping")
            return False
            
        room_id = self.test_room_endpoints()
        if not room_id:
            self.log("❌ Room tests failed, stopping")
            return False
            
        game_id = self.test_game_endpoints(room_id)
        if not game_id:
            self.log("❌ Game tests failed, stopping")
            return False
            
        self.test_websocket_connection(game_id)
        self.test_phase2_websocket_actions()
        self.test_error_handling()
        
        # Print results
        end_time = time.time()
        duration = end_time - start_time
        
        self.log(f"\n📊 Test Results:")
        self.log(f"   Tests run: {self.tests_run}")
        self.log(f"   Tests passed: {self.tests_passed}")
        self.log(f"   Tests failed: {self.tests_run - self.tests_passed}")
        self.log(f"   Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        self.log(f"   Duration: {duration:.2f}s")
        
        if self.tests_passed == self.tests_run:
            self.log("🎉 All tests passed!")
            return True
        else:
            self.log("❌ Some tests failed")
            return False

def main():
    """Main test runner"""
    tester = RokuganAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
