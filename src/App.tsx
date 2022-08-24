import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuth } from './Auth.ctx'
import Login from './login'
import Logout from './logout'
import Register from './register'
import Settings from './settings'

function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return (
    <>
      <nav>
        <ul className="flex-row gap-2">
          <li>
            <Link to="/">home</Link>
          </li>
          {user ? (
            <>
              <li>hi {user.username}!</li>
              <li><Link to="/settings">settings</Link></li>
              <li><Link to="/logout">log out</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/login">login</Link></li>
              <li><Link to="/register">register</Link></li>
            </>
          )}
        </ul>
      </nav>
      {children}
    </>
  )
}

function Home() {
  const { user } = useAuth()
  return (
    <>
      <h1>Home</h1>
      <pre>{JSON.stringify({ user }, null, 2)}</pre>
    </>
  )
}

function NotFound() {
  const route = useLocation().pathname
  return (
    <>
      <h1>Not Found</h1>
      <p>{route} does not exist</p>
    </>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
