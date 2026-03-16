export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Demo mode: create a simple tenant ID based on email
    const tenant_id = btoa(email).slice(0, 20)
    
    // Create a simple JWT token
    const token = btoa(JSON.stringify({
      sub: email,
      tenant_id,
      name: name || email,
      iat: Math.floor(Date.now() / 1000),
    }))

    return Response.json({
      token,
      tenant_id,
      user: { id: email, email, name: name || email },
    })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
