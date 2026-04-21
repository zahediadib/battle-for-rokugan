import { CLANS } from '../constants/gameConstants';

const ASSET_CACHE_NAME = 'rokugan-assets-v1';
const ASSET_META_KEY = 'rokugan-assets-meta-v1';
const ASSET_VERSION = '1';

const COMBAT_TOKEN_FILES = [
  'back.png',
  'bluff.png',
  'diplomacy.png',
  'raid.png',
  'army1.png',
  'army2.png',
  'army3.png',
  'army4.png',
  'army5.png',
  'army6.png',
  'navy1.png',
  'navy2.png',
  'navy3.png',
  'shinobi1.png',
  'shinobi2.png',
  'shinobi3.png',
  'blessing2.png',
  'blessing3.png',
];

const CONTROL_TOKEN_FILES = ['front.png', 'back.png'];
const SPECIAL_TOKEN_FILES = ['ScorchedEarth.png', 'Battlefield.png', 'Shrine.png', 'Peace.png', 'Harbor.png'];
const BONUS_TOKEN_FILES = ['defense1.png', 'defense2.png', 'honor1.png', 'honor2.png', 'honor4.png'];
const BASE_ASSETS = ['/assets/board.png', '/assets/music.mp3', '/assets/shugenja.png', '/assets/scout.png', '/assets/scorpion.png'];

function getAssetUrls() {
  const colorFolders = [...new Set(Object.values(CLANS).map(clan => clan.assetFolder))];
  const urls = [...BASE_ASSETS];

  colorFolders.forEach(color => {
    COMBAT_TOKEN_FILES.forEach(file => urls.push(`/assets/combat/${color}/${file}`));
    CONTROL_TOKEN_FILES.forEach(file => urls.push(`/assets/control/${color}/${file}`));
  });

  SPECIAL_TOKEN_FILES.forEach(file => urls.push(`/assets/special/${file}`));
  BONUS_TOKEN_FILES.forEach(file => urls.push(`/assets/bonus/${file}`));

  return urls;
}

async function areAssetsAlreadyCached(urls) {
  if (!('caches' in window)) return false;
  const cache = await caches.open(ASSET_CACHE_NAME);
  const matches = await Promise.all(
    urls.map(url => cache.match(new URL(url, window.location.origin).toString()))
  );
  return matches.every(Boolean);
}

export async function preloadGameAssets(onProgress) {
  const urls = getAssetUrls();
  const total = urls.length;
  let done = 0;

  const update = (stage) => {
    const percent = total ? Math.round((done / total) * 100) : 100;
    onProgress?.({ stage, done, total, percent });
  };

  update('Loading from Local Storage...');

  const meta = localStorage.getItem(ASSET_META_KEY);
  if (meta) {
    try {
      const parsed = JSON.parse(meta);
      if (parsed.version === ASSET_VERSION && parsed.total === total && await areAssetsAlreadyCached(urls)) {
        done = total;
        update('Assets loaded from local cache');
        return;
      }
    } catch (_) {
      // ignore parse errors and rebuild cache
    }
  }

  update('Downloading assets...');

  const cache = 'caches' in window ? await caches.open(ASSET_CACHE_NAME) : null;
  for (const url of urls) {
    const fullUrl = new URL(url, window.location.origin).toString();
    try {
      let response = cache ? await cache.match(fullUrl) : null;
      if (!response) {
        response = await fetch(fullUrl, { cache: 'force-cache' });
        if (cache && response.ok) {
          await cache.put(fullUrl, response.clone());
        }
      }
    } catch (_) {
      // continue loading remaining assets
    }
    done += 1;
    update('Downloading assets...');
  }

  localStorage.setItem(ASSET_META_KEY, JSON.stringify({
    version: ASSET_VERSION,
    total,
    loadedAt: Date.now(),
  }));
  update('Assets ready');
}
