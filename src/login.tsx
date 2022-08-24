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
      <fieldset>
        <legend>log in</legend>

        <div>
          <label htmlFor="login-username-input">username:</label>
          <input
            type="text"
            name="username"
            id="login-username-input"
          />
          {response?.fieldError?.username && (
            <div className="field-error">{response?.fieldError?.username}</div>
          )}
        </div>

        <div>
          <label htmlFor="login-password-input">password:</label>
          <input type="password" name="password" id="login-password-input" />
          {response?.fieldError?.password && (
            <div className="field-error">{response?.fieldError?.password}</div>
          )}
        </div>

        <div>
          {response?.formError && <div className="field-error">{response?.formError}</div>}
          <button type="submit">login</button>
        </div>
      </fieldset>
    </form>
  )
}
