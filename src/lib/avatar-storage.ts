import { mkdir } from 'node:fs/promises'
import { extname, join } from 'node:path'

const avatarDir = join(process.cwd(), 'public/uploads/avatars')
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

const normalizeExtension = (filename: string) => {
	const extension = extname(filename).toLowerCase()

	if (!allowedExtensions.has(extension)) {
		return null
	}

	return extension === '.jpeg' ? '.jpg' : extension
}

export const saveAvatarFile = async (userId: string, file: File) => {
	const extension = normalizeExtension(file.name)

	if (!extension) {
		throw new Error('Unsupported image type. Use JPG, PNG, WEBP, or GIF.')
	}

	await mkdir(avatarDir, { recursive: true })

	for (const allowed of allowedExtensions) {
		const candidate = Bun.file(join(avatarDir, `${userId}${allowed}`))
		if (await candidate.exists()) {
			await candidate.delete()
		}
	}

	const filename = `${userId}${extension}`
	const destination = join(avatarDir, filename)
	await Bun.write(destination, file)

	return `/uploads/avatars/${filename}`
}

export const deleteAvatarFile = async (avatarUrl: string | null | undefined) => {
	if (!avatarUrl?.startsWith('/uploads/avatars/')) return

	const filename = avatarUrl.replace('/uploads/avatars/', '')
	const file = Bun.file(join(avatarDir, filename))

	if (await file.exists()) {
		await file.delete()
	}
}
