import React from 'react'
import Header from '../Header/Header'
import UserFilesProfile from './UserFilesProfile'
import './UserFilesProfile.css'
import MessageBubble from '../MessageBubble/MessageBubble'

const MainUserFiles = () => {
    return (
        <div>

            <Header />


            <UserFilesProfile />

            <MessageBubble />
            
        </div>
    )
}

export default MainUserFiles
