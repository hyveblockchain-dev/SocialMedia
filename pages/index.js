import { useState, useEffect, useContext } from 'react'
import { css } from '@emotion/css'
import { ethers } from 'ethers'
import { AppContext } from '../context'
import CreatePostModal from '../components/CreatePostModal'
import HYVESOCIAL_ABI from '../abi/hyvesocial.json'

const HYVESOCIAL_CONTRACT = '0xd9145CCE52D386f254917e481eB44e9943F39138'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { profile, address } = useContext(AppContext)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(
        HYVESOCIAL_CONTRACT,
        HYVESOCIAL_ABI,
        provider
      )

      // Get total number of posts
      const totalPosts = await contract.getTotalPosts()
      console.log('Total posts:', totalPosts.toString())

      if (totalPosts === BigInt(0)) {
        setPosts([])
        setLoading(false)
        return
      }

      // Fetch last 20 posts
      const postsToFetch = totalPosts > BigInt(20) ? 20 : Number(totalPosts)
      const fetchedPosts = []

      for (let i = 0; i < postsToFetch; i++) {
        const postId = totalPosts - BigInt(i) - BigInt(1)
        try {
          const postData = await contract.getPost(postId)
          
          // Get author profile
          let authorUsername = 'Unknown'
          try {
            const profileData = await contract.getProfile(postData[1])
            authorUsername = profileData[0] || 'Unknown'
          } catch (e) {
            console.log('Could not fetch author profile')
          }

          fetchedPosts.push({
            id: postData[0].toString(),
            author: postData[1],
            authorUsername: authorUsername,
            content: postData[2],
            mediaUrl: postData[3],
            timestamp: postData[4].toString(),
            likes: postData[5].toString()
          })
        } catch (error) {
          console.error(`Error fetching post ${postId}:`, error)
        }
      }

      setPosts(fetchedPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function likePost(postId) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        HYVESOCIAL_CONTRACT,
        HYVESOCIAL_ABI,
        signer
      )

      const tx = await contract.likePost(postId)
      alert('Liking post... Waiting for confirmation')
      await tx.wait()
      alert('Post liked! 🎉')
      
      // Refresh posts
      await fetchPosts()
    } catch (error) {
      console.error('Error liking post:', error)
      if (error.message.includes('Already liked')) {
        alert('You already liked this post!')
      } else {
        alert('Failed to like post')
      }
    }
  }

  function formatTimestamp(timestamp) {
    const date = new Date(parseInt(timestamp) * 1000)
    const now = new Date()
    const diff = now - date
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className={containerStyle}>
      {isModalOpen && <CreatePostModal setIsModalOpen={setIsModalOpen} />}
      
      <div className={searchContainerStyle}>
        <input placeholder="Search" className={searchInputStyle} />
        <button className={searchButtonStyle}>SEARCH POSTS</button>
      </div>

      {profile && (
        <div className={createPostButtonContainer}>
          <button 
            className={createPostButton}
            onClick={() => setIsModalOpen(true)}
          >
            ✏️ Create Post
          </button>
        </div>
      )}

      <div className={feedContainerStyle}>
        {loading ? (
          <div className={emptyStateStyle}>
            <p className={emptyIconStyle}>⏳</p>
            <h2>Loading posts...</h2>
          </div>
        ) : posts.length === 0 ? (
          <div className={emptyStateStyle}>
            <p className={emptyIconStyle}>👥</p>
            <h2>No Posts Yet</h2>
            <p className={emptyTextStyle}>
              Be the first to post on Hyve Social!
            </p>
            {profile && (
              <button 
                className={emptyButtonStyle}
                onClick={() => setIsModalOpen(true)}
              >
                Create Your First Post
              </button>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className={postStyle}>
              <div className={postHeaderStyle}>
                <div>
                  <p className={authorStyle}>@{post.authorUsername}</p>
                  <p className={addressTextStyle}>
                    {post.author.slice(0, 6)}...{post.author.slice(-4)}
                  </p>
                </div>
                <p className={timestampStyle}>{formatTimestamp(post.timestamp)}</p>
              </div>
              
              <p className={postContentStyle}>{post.content}</p>
              
              <div className={postFooterStyle}>
                <button 
                  className={likeButtonStyle}
                  onClick={() => profile && likePost(post.id)}
                  disabled={!profile}
                >
                  ❤️ {post.likes}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!profile && !loading && (
        <div className={signInPromptStyle}>
          <p>👆 Sign in to create posts and interact!</p>
        </div>
      )}
    </div>
  )
}

const createPostButtonContainer = css`
  max-width: 800px;
  margin: 0 auto 20px auto;
`

const createPostButton = css`
  width: 100%;
  padding: 15px;
  background-color: rgb(249, 92, 255);
  color: #340036;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: rgba(249, 92, 255, 0.85);
    transform: translateY(-2px);
  }
`

const signInPromptStyle = css`
  text-align: center;
  margin-top: 40px;
  padding: 20px;
  background-color: rgba(249, 92, 255, 0.1);
  border-radius: 10px;
  max-width: 800px;
  margin: 40px auto;
  
  p {
    color: #666;
    font-size: 16px;
    margin: 0;
  }
`

const containerStyle = css`
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
`

const searchContainerStyle = css`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  gap: 10px;
`

const searchInputStyle = css`
  padding: 15px 20px;
  border-radius: 50px;
  border: 2px solid #e0e0e0;
  width: 500px;
  font-size: 16px;
  outline: none;
  
  &:focus {
    border-color: rgb(249, 92, 255);
  }
`

const searchButtonStyle = css`
  background-color: #DAA520;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: #C4941A;
  }
`

const feedContainerStyle = css`
  max-width: 800px;
  margin: 0 auto;
`

const postStyle = css`
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`

const postHeaderStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`

const authorStyle = css`
  font-weight: 700;
  font-size: 18px;
  color: #1a1a1a;
  margin: 0 0 5px 0;
`

const addressTextStyle = css`
  font-size: 12px;
  color: #999;
  margin: 0;
`

const timestampStyle = css`
  color: #999;
  font-size: 14px;
  margin: 0;
`

const postContentStyle = css`
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin: 15px 0;
  white-space: pre-wrap;
`

const postFooterStyle = css`
  display: flex;
  gap: 15px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
`

const likeButtonStyle = css`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    color: rgb(249, 92, 255);
    transform: scale(1.1);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const emptyStateStyle = css`
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const emptyIconStyle = css`
  font-size: 80px;
  margin-bottom: 20px;
`

const emptyTextStyle = css`
  color: #666;
  font-size: 16px;
  margin: 15px 0;
`

const emptyButtonStyle = css`
  margin-top: 20px;
  padding: 15px 30px;
  background-color: rgb(249, 92, 255);
  color: #340036;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: rgba(249, 92, 255, 0.85);
    transform: translateY(-2px);
  }
`
