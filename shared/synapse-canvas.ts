export type SynapseNode = {
	x: number
	y: number
	vx: number
	vy: number
	r: number
}

export const synapseCanvasStyles = `
    #synapses {
      position: fixed;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      opacity: 0.7;
    }
    .card {
      position: relative;
      z-index: 2;
    }
`

export function initSynapseCanvas(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext('2d')
	if (!ctx) return () => {}

	let frameId = 0
	let nodes: SynapseNode[] = []

	const onResize = () => {
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight
	}

	onResize()
	window.addEventListener('resize', onResize)

	nodes = Array.from({ length: 42 }, () => ({
		x: Math.random() * canvas.width,
		y: Math.random() * canvas.height,
		vx: (Math.random() - 0.5) * 0.4,
		vy: (Math.random() - 0.5) * 0.4,
		r: Math.random() * 2 + 1,
	}))

	const draw = () => {
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		for (let i = 0; i < nodes.length; i++) {
			const a = nodes[i]!
			a.x += a.vx
			a.y += a.vy

			if (a.x < 0 || a.x > canvas.width) a.vx *= -1
			if (a.y < 0 || a.y > canvas.height) a.vy *= -1

			ctx.beginPath()
			ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
			ctx.fillStyle = 'rgba(255, 107, 203, 0.85)'
			ctx.fill()

			for (let j = i + 1; j < nodes.length; j++) {
				const b = nodes[j]!
				const dx = a.x - b.x
				const dy = a.y - b.y
				const dist = Math.sqrt(dx * dx + dy * dy)

				if (dist < 120) {
					ctx.beginPath()
					ctx.moveTo(a.x, a.y)
					ctx.lineTo(b.x, b.y)
					ctx.strokeStyle = `rgba(0, 245, 212, ${(1 - dist / 120) * 0.35})`
					ctx.lineWidth = 0.6
					ctx.stroke()
				}
			}
		}

		frameId = requestAnimationFrame(draw)
	}

	draw()

	return () => {
		cancelAnimationFrame(frameId)
		window.removeEventListener('resize', onResize)
	}
}

/** Inline bootstrap for standalone HTML error pages */
export const synapseCanvasInlineScript = `(${initSynapseCanvas.toString()})(document.getElementById('synapses'))`
