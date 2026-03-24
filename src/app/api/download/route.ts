import { NextRequest, NextResponse } from 'next/server';
import { spawn, execSync } from 'child_process';

const MODERN_MOBILE_AGENT = 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36';

export const dynamic = 'force-dynamic';

function checkDependencies() {
  try {
    execSync('yt-dlp --version', { stdio: 'ignore' });
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

async function handleAnalyze(url: string) {
  const args = [
    '--get-title', 
    '--get-thumbnail', 
    '--no-playlist', 
    '--quiet', 
    '--user-agent', MODERN_MOBILE_AGENT,
    '--extractor-args', 'youtube:player_client=android,web',
    url
  ];
  const ytDlp = spawn('yt-dlp', args);
  let stdout = '';
  
  return new Promise((resolve) => {
    ytDlp.stdout.on('data', (d) => stdout += d.toString());
    ytDlp.on('close', (code) => {
      if (code === 0 && stdout.trim()) {
        const lines = stdout.trim().split('\n');
        resolve(NextResponse.json({ 
          type: 'success', 
          data: { title: lines[0], thumbnail: lines[1] } 
        }));
      } else {
        resolve(NextResponse.json({ type: 'error', message: 'Analysis failed. Media restricted or offline.' }, { status: 400 }));
      }
    });
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, mode } = body;

  if (!checkDependencies()) {
    return NextResponse.json({ error: 'System dependencies (yt-dlp/ffmpeg) missing.' }, { status: 500 });
  }

  if (mode === 'analyze') {
    return await handleAnalyze(url) as Response;
  }

  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const quality = searchParams.get('quality') || 'best';
  const title = searchParams.get('title') || 'VeloStream_HD';

  if (!url) return NextResponse.json({ error: 'URL required.' }, { status: 400 });
  if (!checkDependencies()) return NextResponse.json({ error: 'System dependencies missing.' }, { status: 500 });

  // --- STRICT HD & ANTI-THROTTLE LOGIC ---
  let format = 'bestvideo[height<=1080]+bestaudio/best';
  let extension = 'mp4';
  const extraArgs: string[] = [
    '--extractor-args', 'youtube:player_client=android,web',
    '--throttled-rate', '100K', // Activates anti-throttling bypass
    '--merge-output-format', 'mp4'
  ];

  if (quality === '720p') {
    format = 'bestvideo[height<=720]+bestaudio/best';
  } else if (quality === '480p') {
    format = 'bestvideo[height<=480]+bestaudio/best';
  } else if (quality === 'mp3') {
    format = 'bestaudio';
    extension = 'mp3';
    extraArgs.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
  }

  // --- QUALITY DIAGNOSTICS ---
  try {
    const diagArgs = [
      '--print', 'EXT: %(ext)s | VCODEC: %(vcodec)s | RES: %(resolution)s | FPS: %(fps)s | SIZE: %(filesize_approx,filesize)s',
      '-f', format,
      '--no-playlist',
      '--user-agent', MODERN_MOBILE_AGENT,
      '--extractor-args', 'youtube:player_client=android,web',
      url
    ];
    const diagOutput = execSync(`yt-dlp ${diagArgs.map(a => `"${a}"`).join(' ')}`, { encoding: 'utf8' }).trim();
    console.log(`\x1b[32m[VeloStream Diagnostic Win]\x1b[0m ${diagOutput}`);
  } catch (e) {
    console.warn('[Diagnostic] Metadata probe skipped.');
  }

  const args = [
    '-o', '-', 
    '-f', format,
    '--no-playlist',
    '--no-warnings',
    '--quiet',
    '--user-agent', MODERN_MOBILE_AGENT,
    ...extraArgs,
    url
  ];

  console.log(`[VeloStream Engine] Finalizing HD Extraction: ${quality}`);

  const ytDlp = spawn('yt-dlp', args, { stdio: ['ignore', 'pipe', 'pipe'] });

  request.signal.addEventListener('abort', () => {
    console.log('[VeloStream] Download canceled. Killing process.');
    ytDlp.kill('SIGKILL');
  });
  
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  let hasData = false;

  ytDlp.stdout.on('data', async (chunk) => {
    hasData = true;
    try {
      if (writer.desiredSize !== null) {
        await writer.write(chunk);
      }
    } catch (e) {
      ytDlp.kill();
    }
  });

  ytDlp.on('close', async (code) => {
    console.log(`[VeloStream] Process exited (Code ${code})`);
    try {
      if (writer.desiredSize !== null) {
        await writer.close();
      }
    } catch (e) {}
  });

  const headers = new Headers();
  headers.set('Content-Disposition', `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_')}.${extension}"`);
  headers.set('Content-Type', extension === 'mp3' ? 'audio/mpeg' : 'video/mp4');
  headers.set('Cache-Control', 'no-cache');

  return new Response(readable, { headers });
}
