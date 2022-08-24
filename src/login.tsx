import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './Auth.ctx'

export default function Login() {
  const [response, setResponse] = useState<any>()
  const auth = useAuth()
  const navigate = useNavigate()
  return (
    <form
      method="POST"
      onSubmit={ev => {
        ev.preventDefault()
        const body = new URLSearchParams(new FormData(ev.currentTarget) as any)
        fetch('/login', { method: 'post', body })
          .then(res => res.json())
          .then(res => {
            if (!res.user_id) return setResponse(res)
            auth.setUser(res)
            navigate('/')
          })
      }}
    >
      <div>
        <label>
          username:
          <input type="text" name="username" />
        </label>
        {response?.fieldError?.username && <div>{response?.fieldError?.username}</div>}
      </div>

      <div>
        <label>
          password:
          <input type="password" name="password" />
        </label>
        {response?.fieldError?.password && <div>{response?.fieldError?.password}</div>}
      </div>

      <div>
        {response?.formError && <div>{response?.formError}</div>}
        <button type="submit">login</button>
      </div>
    </form>
  )
}
