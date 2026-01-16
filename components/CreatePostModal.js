import { useState, useRef, useContext } from 'react'
import { css } from '@emotion/css'
import { ethers } from 'ethers'
import { AppContext } from '../context'
import HYVESOCIAL_ABI from '../abi/hyvesocial.json'

const HYVESOCIAL_CONTRACT = '0xd9145CCE52D386f254917e481eB44e9943F39138'

export default function CreatePostModal({ setIsModalOpen }) {
  const { profile, address } = useContext(AppContext)
  const [creating, setCreating] = useState(false)
  const inputRef = useRef(null)

  // Check if profile exists
  if (!profile) {
    return (
      <div className={containerStyle}>
        <div className={contentContainerStyle}>
          <div className={topBarStyle}>
            <div className={topBarTitleStyle}>
              <p>Profile Required</p>
            </div>
            <div onClick={() => setIsModalOpen(false)}>
              <img src="/close.svg" className={createPostIconStyle} />
            </div>
          </div>
          <div className={contentStyle}>
            <div className={errorMessageStyle}>
              <p>⚠️ You need to create a profile first!</p>
              <p>Please create your profile to start posting.</p>
            </div>
            <div className={buttonContainerStyle}>
              <button className={buttonStyle} onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  async function savePost() {
    const content = inputRef.current.innerText || inputRef.current.textContent
    
    if (!content || content.trim().length === 0) {
      alert('Please enter some content for your post')
      return
    }

    try {
      setCreating(true)

      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Create contract instance
      const contract = new ethers.Contract(
        HYVESOCIAL_CONTRACT,
        HYVESOCIAL_ABI,
        signer
      )

      console.log('Creating post on Hyve Blockchain...')

      // Call createPost function
      const tx = await contract.createPost(content.trim(), '') // Empty mediaUrl for now
      
      console.log('Transaction sent:', tx.hash)
      alert('Transaction sent! Waiting for confirmation...')

      // Wait for transaction to be mined
      await tx.wait()
      
      console.log('Post created successfully!')
      alert('Post created successfully! 🎉')
      
      setIsModalOpen(false)
      
      // Reload the page to show new post
      window.location.reload()
      
    } catch (err) {
      console.error('Error creating post:', err)
      
      if (err.code === 'ACTION_REJECTED') {
        alert('Transaction cancelled')
      } else if (err.message.includes('Profile does not exist')) {
        alert('Profile not found. Please create a profile first.')
      } else {
        alert('Failed to create post. Check console for details.')
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className={containerStyle}>
      <div className={contentContainerStyle}>
        <div className={topBarStyle}>
          <div className={topBarTitleStyle}>
            <p>Create post</p>
          </div>
          <div onClick={() => !creating && setIsModalOpen(false)}>
            <img src="/close.svg" className={createPostIconStyle} />
          </div>
        </div>
        <div className={contentStyle}>
          <div className={bottomContentStyle}>
            <div 
              className={postInputStyle} 
              contentEditable={!creating}
              ref={inputRef}
              suppressContentEditableWarning
            >
            </div>
            <div className={buttonContainerStyle}>
              <button 
                className={buttonStyle} 
                onClick={savePost}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const errorMessageStyle = css`
  padding: 20px;
  text-align: center;
  p {
    margin: 10px 0;
    line-height: 1.6;
  }
`

const buttonStyle = css`
  border: none;
  outline: none;
  background-color: rgb(249, 92, 255);
  padding: 13px 24px;
  color: #340036;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all .35s;
  &:hover {
    background-color: rgba(249, 92, 255, .75);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const buttonContainerStyle = css`
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
`

const postInputStyle = css`
  border: 1px solid rgba(0, 0, 0, .14);
  border-radius: 8px;
  width: 100%;
  min-height: 100px;
  padding: 12px 14px;
  font-weight: 500;
  outline: none;
  &:empty:before {
    content: "What's on your mind?";
    color: #999;
  }
`

const bottomContentStyle = css`
  margin-top: 10px;
`

const topBarStyle = css`
  display: flex;
  align-items: flex-end;
  border-bottom: 1px solid rgba(0, 0, 0, .1);
  padding-bottom: 13px;
  padding: 15px 25px;
`

const topBarTitleStyle = css`
  flex: 1;
  p {
    margin: 0;
    font-weight: 600;
  }
`

const contentContainerStyle = css`
  background-color: white;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, .15);
  width: 700px;
  max-width: 90vw;
`

const containerStyle = css`
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 10;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, .35);
`

const contentStyle = css`
  padding: 15px 25px;
`

const createPostIconStyle = css`
  height: 20px;
  cursor: pointer;
`
