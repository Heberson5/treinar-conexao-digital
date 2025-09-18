export interface VideoInfo {
  isYoutube: boolean;
  thumbnailUrl: string | null;
  embedUrl: string | null;
}

export function getVideoInfo(videoUrl: string): VideoInfo {
  // YouTube URL patterns
  const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      isYoutube: true,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`
    };
  }
  
  // For non-YouTube videos, return basic info
  return {
    isYoutube: false,
    thumbnailUrl: null,
    embedUrl: videoUrl
  };
}

export function getVideoThumbnail(videoUrl: string, fallbackImage?: string): string {
  const videoInfo = getVideoInfo(videoUrl);
  return videoInfo.thumbnailUrl || fallbackImage || '/api/placeholder/300/200';
}