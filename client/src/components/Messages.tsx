import React, { useState, useContext, Dispatch, SetStateAction } from 'react';
import { Socket } from '../Socket'
import styled from 'styled-components'
import { MessageBoxComponent } from './MessageBox'
import { usersContext } from '../context/userContext'
interface MessagesComponentProps {
   socket: Socket | null,
   notifications: string[],
   setNotifications: Dispatch<SetStateAction<string[]>>
}
function MessagesComponent({socket, notifications, setNotifications}:MessagesComponentProps) {
   let [userInput, setUserInput] = useState("")
   let [messages, setMessages] = useState<any>({"no-user": []})
   let handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => setUserInput(event.currentTarget.value)
   let userContext = useContext(usersContext)
   let user = userContext?.user || ""
   let chatUser = userContext?.chatUser
   let chatUserName = "no-user"
   let chatUserId = "no-user"
   if (chatUser) {
      chatUserName = chatUser?.split("..")[0]
      chatUserId = chatUser?.split("..")[1]
   }
   let sendMessage = () => {
      if (userInput != "") {
         socket?.emitMessage(chatUserId, userInput)
         pushMessage(chatUserName || "", userInput, user)
         setUserInput("")
      }
   }
   let addNotification = (user: string) => {
      let previous = notifications.some(notification => notification === user)
      let new_notifications
      if (!previous) {
         new_notifications = [...notifications, user]
         setNotifications(new_notifications)
      }
   }
   let pushMessage = (user: string, text: string, sender: string) => {
      if (!messages[user]) {
         messages[user] = []
      }
      let new_messages = {...messages}
      new_messages[user] = [{recipient: sender, message: text}, ...messages[user]]
      setMessages(new_messages)
   }
   let onEnter = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter') {
         sendMessage()
       }
   }
   socket?.receiveMessage({pushMessage, addNotification})
   return (
      <MessageSection>
         <MessageBoxComponent messages={chatUser ? (messages[chatUserName] ? messages[chatUserName]: []) : []} />
         <EditSection>
            <TextBox>
               {
                  chatUser && <textarea  value={userInput} onChange={handleInputChange} onKeyDown={onEnter}></textarea>
               }
            </TextBox>
            {
               chatUser &&
               <ButtonSection onClick={sendMessage} >
                  SEND
               </ButtonSection>
            }
         </EditSection>
      </MessageSection>
   )
 }

export { MessagesComponent }

let MessageSection = styled.div`
   display: flex;
   flex-direction: column;
   height: 100%;
   flex: 3 0 600px;
`
let TextBox = styled.div`
   display: flex;
   flex: 5 0 0;
   align-items: center;
   justify-content: center;
   background-color: rgba(0,0,0,0.1);
   textarea {
      width: 90%;
      height: 30px;
      resize: none;
   }
`
let ButtonSection = styled.div`
   display: flex;
   flex: 1 0 0;
   align-items: center;
   justify-content: center;
   font-size: 20px;
   font-weight: bold;
   cursor: pointer;
   background-color: lightsteelblue;
   &:hover {
      background-color: rgb(174, 214, 241);
   }
`
let EditSection = styled.div`
   display: flex;
   flex: 0 0 70px;
`
