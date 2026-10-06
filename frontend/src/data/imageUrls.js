export const thumbnailImageUrl = (photo) => photo.thumbnailUrl || photo.imageUrl;
export const displayImageUrl = (photo) => photo.displayUrl || photo.imageUrl;
export const largeImageUrl = (photo) => photo.largeUrl || photo.displayUrl || photo.imageUrl;
export const originalImageUrl = (photo) => photo.originalImageUrl || photo.imageUrl;

export function imageSrcSet(photo, minimumSize = 'thumbnail') {
	const candidates = [
		{ url: photo.thumbnailUrl, width: 480 },
		{ url: photo.displayUrl, width: 1200 },
		{ url: photo.largeUrl, width: 1920 }
	].filter((candidate, index, all) => candidate.url && all.findIndex(item => item.url === candidate.url) === index);
	if (!candidates.length) return undefined;
	const minimumWidth = minimumSize === 'display' ? 1200 : 480;
	const sizedCandidates = candidates.filter(candidate => candidate.width >= minimumWidth || candidate === candidates[candidates.length - 1]);
	return sizedCandidates.map(candidate => `${candidate.url} ${candidate.width}w`).join(', ');
}