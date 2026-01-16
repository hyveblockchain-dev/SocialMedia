import { useState } from 'react'
import { css } from '@emotion/css'
import { ethers } from 'ethers'
import HYVESOCIAL_ABI from '../abi/hyvesocial.json'

const HYVESOCIAL_CONTRACT = '0xd9145CCE52D386f254917e481eB44e9943F39138'

export default function ProfileSetup({ onProfileCreated }) {
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [creating, setCreating] = useState(false)

  async function createProfile() {
    if (!username || username.trim().length === 0) {
      alert('Please enter a username')
      return
    }

    try {
      setCreating(true)

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const contract = new ethers.Contract(
        HYVESOCIAL_CONTRACT,
        HYVESOCIAL_ABI,
        signer
      )

      console.log('Creating profile on Hyve Blockchain...')

      const tx = await contract.createProfile(
        username.trim(),
        bio.trim() || '',
        avatarUrl.trim() || ''
      )

      console.log('Transaction sent:', tx.hash)
      alert('Transaction sent! Creating your profile...')

      await tx.wait()

      console.log('Profile created successfully!')
      alert('Profile created successfully! 🎉')

      if (onProfileCreated) {
        onProfileCreated()
      }

    } catch (err) {
      console.error('Error creating profile:', err)

      if (err.code === 'ACTION_REJECTED') {
        alert('Transaction cancelled')
      } else if (err.message.includes('Profile already exists')) {
        alert('You already have a profile!')
        if (onProfileCreated) {
          onProfileCreated()
        }
      } else {
        alert('Failed to create profile. Check console for details.')
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className={containerStyle}>
      <div className={cardStyle}>
        <div className={headerStyle}>
          <h1>🎭 Create Your Profile</h1>
          <p>Welcome to Hyve Social! Set up your on-chain profile to get started.</p>
        </div>

        <div className={formStyle}>
          <div className={fieldStyle}>
            <label>Username *</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={creating}
              maxLength={50}
            />
          </div>

          <div className={fieldStyle}>
            <label>Bio</label>
            <textarea
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={creating}
              rows={3}
            />
          </div>

          <div className={fieldStyle}>
            <label>Avatar URL</label>
            <input
              type="text"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              disabled={creating}
            />
          </div>

          <button
            className={buttonStyle}
            onClick={createProfile}
            disabled={creating || !username}
          >
            {creating ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </div>

        <div className={infoStyle}>
          <p>💡 Your profile will be stored on Hyve Blockchain</p>
          <p>⛽ This requires a small gas fee</p>
        </div>
      </div>
    </div>
  )
}

const containerStyle = css`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
`

const cardStyle = css`
  background-color: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`

const headerStyle = css`
  text-align: center;
  margin-bottom: 30px;

  h1 {
    font-size: 32px;
    margin: 0 0 10px 0;
    color: #1a1a1a;
  }

  p {
    color: #666;
    margin: 0;
    font-size: 16px;
  }
`

const formStyle = css`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const fieldStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 600;
    color: #1a1a1a;
    font-size: 14px;
  }

  input, textarea {
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    font-family: inherit;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: rgb(249, 92, 255);
    }

    &:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
`

const buttonStyle = css`
  padding: 16px 32px;
  background-color: rgb(249, 92, 255);
  color: #340036;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;

  &:hover:not(:disabled) {
    background-color: rgba(249, 92, 255, 0.85);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const infoStyle = css`
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  text-align: center;

  p {
    color: #666;
    font-size: 14px;
    margin: 8px 0;
  }
`
