import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const BASE_URL = 'https://ribbit.dk/Assets/Grx/outlaw_push/';

const OUTPUT_DIR = path.resolve('outlaw_push');
const TOTAL_FRAMES = 23;

// ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
// S1_00419.webp
async function downloadFrames() {
	for (let i = 0; i <= TOTAL_FRAMES; i++) {
		const filename = `${String(i).padStart(3, '0')}.png`;
		const url = BASE_URL + filename;
		const filepath = path.join(OUTPUT_DIR, filename);

		// console.log(url, 'filepath');

		try {
			const res = await fetch(url);

			if (!res.ok) {
				console.warn(`⚠️  Skip ${filename} (${res.status})`);
				continue;
			}

			const buffer = Buffer.from(await res.arrayBuffer());
			fs.writeFileSync(filepath, buffer);

			console.log(`✅ Downloaded ${filename}`);
		} catch (err) {
			console.error(`❌ Error downloading ${filename}:`, err);
		}
	}

	console.log('🎉 All frames processed');
}

downloadFrames();
