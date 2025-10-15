import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Main from './components/Main'
import Chat from './components/chat'
import ErrorPage from './components/ErrorPage'
import Favorite from './components/favorite'
import Login from './components/login'
import Register from './components/register'
import PostPage from './components/postPage'
import PostUpload from './components/postUpload'
import Settings from './components/settings'
import Messenger from './components/messanger' 
import Profile from './components/profile'
import Friends from './components/Frineds' 
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/favorite' element={<Favorite />} />
        <Route path='/profile' element={<Profile />} /> 
        <Route path='/settings' element={<Settings />} />
        <Route path='/messenger' element={<Messenger />} /> 
        <Route path='/chat/:chatId' element={<Chat />} /> 
        <Route path='/404' element={<ErrorPage />} />
        <Route path='/upload' element={<PostUpload />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path='/post/:postId' element={<PostPage />} /> 
        <Route path='/post' element={<PostPage />} /> 
        <Route path='/friends' element={<Friends />} /> 
        
        <Route path='*' element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App