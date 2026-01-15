import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import { createClient, basicClient, searchPublications, timeline, explorePublications } from '../api'
import { css } from '@emotion/css'
import { ethers } from 'ethers'
import { Button, SearchInput, Placeholders } from '../components'
import { AppContext } from '../context'
import Link from 'next/link'

const typeMap = {
  Comment: "Comment",
  Mirror: "Mirror",
  Post: "Post"
}

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loadingState, setLoadingState] = useState('loading')
  const [searchString, setSearchString] = useState('')
  const { profile } = useContext(AppContext)
  const router = useRouter()

  useEffect(() => {
    fetchPosts()
  }, [profile])

  async function fetchPosts() {
    try {
      const provider = new ethers.providers.Web3Provider(
        (window).ethereum
      )
      const addresses = await provider.listAccounts()
      
      if (profile) {
        // If user is signed in, fetch their timeline
        try {
          const client = await createClient()
          const response = await client.query(timeline, {
            profileId: profile.id, limit: 15
          }).toPromise()
          
          let posts = response.data.timeline.items.filter(post => {
            if (post.profile) {
              post.backgroundColor = generateRandomColor()
              return post
            }
          })
          
          // Process profile pictures
          posts = posts.map(post => {
            let picture = post.profile.picture
            if (picture && picture.original && picture.original.url) {
              if (picture.original.url.startsWith('ipfs://')) {
                let result = picture.original.url.substring(7, picture.original.url.length)
                post.profile.picture.original.url = `http://lens.infura-ipfs.io/ipfs/${result}`
              }
            }
            return post
          })
          
          setPosts(posts)
          setLoadingState('loaded')
        } catch (error) {
          console.log('Error fetching timeline:', error)
          setLoadingState('error')
        }
      } else if (!addresses.length) {
        // If not signed in, fetch explore publications
        try {
          const response = await basicClient.query(explorePublications).toPromise()
          const posts = response.data.explorePublications.items.filter(post => {
            if (post.profile) {
              post.backgroundColor = generateRandomColor()
              return post
            }
          })
          setPosts(posts)
          setLoadingState('loaded')
        } catch (error) {
          console.log('Error fetching explore posts:', error)
          setLoadingState('error')
        }
      }
    } catch (err) {
      console.log('Error in fetchPosts:', err)
      setLoadingState('error')
    }
  }

  async function searchForPost() {
    setLoadingState('searching')
    try {
      const urqlClient = await createClient()
      const response = await urqlClient.query(searchPublications, {
        query: searchString, type: 'PUBLICATION'
      }).toPromise()
      
      const postData = response.data.search.items.filter(post => {
        if (post.profile) {
          post.backgroundColor = generateRandomColor()
          return post
        }
      })
      
      setPosts(postData)
      if (!postData.length) {
        setLoadingState('no-results')
      } else {
        setLoadingState('loaded')
      }
    } catch (error) {
      console.log('Error searching:', error)
      setLoadingState('error')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      searchForPost()
    }
  }

  function generateRandomColor() {
    const colors = [
      '#FFB6C1', '#98D8C8', '#F6E58D', '#BADC58', 
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#DDA15E', '#BC6C25'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <div>
      <div className={searchContainerStyle}>
        <SearchInput
          placeholder='Search'
          onChange={e => setSearchString(e.target.value)}
          value={searchString}
          onKeyDown={handleKeyDown}
        />
        <Button
          buttonText="SEARCH POSTS"
          onClick={searchForPost}
        />
      </div>
      
      {/* Welcome/Empty State Section */}
      {loadingState === 'loaded' && posts.length === 0 && (
        <div className={emptyStateContainerStyle}>
          <div className={emptyStateCardStyle}>
            <div className={iconContainerStyle}>
              <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            
            <h2 className={emptyStateTitleStyle}>
              {profile ? 'Your Feed is Empty' : 'Welcome to Hyve Social!'}
            </h2>
            
            <p className={emptyStateDescriptionStyle}>
              {profile 
                ? "You're not following anyone yet, or no one has posted recently. Start exploring profiles and building your network!"
                : "Connect your wallet to start exploring the decentralized social network built on Lens Protocol."
              }
            </p>
            
            <div className={actionsContainerStyle}>
              {profile ? (
                <>
                  <Link href="/profiles">
                    <a>
                      <button className={primaryButtonStyle}>
                        <svg className={buttonIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Explore Profiles
                      </button>
                    </a>
                  </Link>
                  <Link href={`/profile/${profile.id}`}>
                    <a>
                      <button className={secondaryButtonStyle}>
                        <svg className={buttonIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        View Your Profile
                      </button>
                    </a>
                  </Link>
                </>
              ) : (
                <>
                  <button className={primaryButtonStyle} onClick={() => window.location.reload()}>
                    <svg className={buttonIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Get Started
                  </button>
                  <Link href="/profiles">
                    <a>
                      <button className={secondaryButtonStyle}>
                        <svg className={buttonIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Browse Profiles
                      </button>
                    </a>
                  </Link>
                </>
              )}
            </div>
            
            {/* Feature Highlights */}
            <div className={featuresContainerStyle}>
              <div className={featureItemStyle}>
                <div className={featureIconStyle}>🔒</div>
                <h4 className={featureTitleStyle}>Decentralized</h4>
                <p className={featureDescStyle}>Your data, your control. Built on blockchain technology.</p>
              </div>
              <div className={featureItemStyle}>
                <div className={featureIconStyle}>🌐</div>
                <h4 className={featureTitleStyle}>Web3 Native</h4>
                <p className={featureDescStyle}>Connect with your crypto wallet and own your identity.</p>
              </div>
              <div className={featureItemStyle}>
                <div className={featureIconStyle}>🚀</div>
                <h4 className={featureTitleStyle}>Lens Protocol</h4>
                <p className={featureDescStyle}>Powered by the leading decentralized social graph.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={listItemContainerStyle}>
        {
          loadingState === 'no-results' && (
            <div className={noResultsContainerStyle}>
              <svg className={noResultsIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className={noResultsTitleStyle}>No results found</h2>
              <p className={noResultsDescStyle}>Try searching for something else or browse profiles to discover content.</p>
              <Link href="/profiles">
                <a>
                  <button className={browseButtonStyle}>Browse Profiles</button>
                </a>
              </Link>
            </div>
          )
        }
        {
          loadingState === 'loading' && <Placeholders number={6} />
        }
        {
          loadingState === 'searching' && <Placeholders number={3} />
        }
        {
          loadingState === 'error' && (
            <div className={errorContainerStyle}>
              <svg className={errorIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className={errorTitleStyle}>Error loading posts</h2>
              <p className={errorDescStyle}>Please try refreshing the page or connect your wallet.</p>
              <button className={retryButtonStyle} onClick={fetchPosts}>
                <svg className={buttonIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          )
        }
        {
          loadingState === 'loaded' && posts.length > 0 && posts.map((post, index) => (
            <Link href={`/profile/${post.profile.id || post.profile.profileId}`} key={index}>
              <a>
                <div className={listItemStyle}>
                  <p className={itemTypeStyle}>{typeMap[post.__typename]}</p>
                  <div className={profileContainerStyle}>
                    {
                      post.profile.picture && post.profile.picture.original ? (
                        <img src={post.profile.picture.original.url} className={profileImageStyle} />
                      ) : (
                        <div
                          className={
                            css`
                              ${placeholderStyle};
                              background-color: ${post.backgroundColor};
                            `
                          }
                        />
                      )
                    }
                  </div>
                  <div>
                    <div className={profileInfoStyle}>
                      <h3 className={nameStyle}>{post.profile.name}</h3>
                      <p className={handleStyle}>{post.profile.handle}</p>
                    </div>
                    <div>
                      <p className={latestPostStyle}>{trimString(post.metadata.content, 200)}</p>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))
        }
      </div>
    </div>
  )
}

const trimString = (string, length) => {
  if (!string) return ''
  if (string.length <= length) {
    return string
  }
  return string.substring(0, length) + '...'
}

function generateRandomColor() {
  let randomColor = Math.floor(Math.random() * 16777215).toString(16);
  randomColor = `#${randomColor}`
  return randomColor
}

const searchContainerStyle = css`
  padding: 40px 0px 30px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const listItemContainerStyle = css`
  display: flex;
  flex-direction: column;
  padding-bottom: 80px;
`

const listItemStyle = css`
  background-color: #1a1a1a;
  margin: 15px 0px;
  padding: 20px 30px;
  border-radius: 15px;
  border: 1px solid #2a2a2a;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: row;
  cursor: pointer;
  position: relative;
  &:hover {
    background-color: #252525;
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(218, 165, 32, 0.1);
  }
`

const profileContainerStyle = css`
  width: 60px;
  margin-right: 20px;
`

const profileImageStyle = css`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #DAA520;
`

const placeholderStyle = css`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #DAA520;
`

const nameStyle = css`
  margin: 0;
  font-weight: 600;
  font-size: 16px;
  color: #DAA520;
`

const handleStyle = css`
  margin: 5px 0px;
  color: #888;
  font-size: 14px;
`

const latestPostStyle = css`
  margin: 15px 0px 0px;
  padding: 0px;
  color: #e0e0e0;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
`

const itemTypeStyle = css`
  position: absolute;
  top: 20px;
  right: 25px;
  font-size: 11px;
  font-weight: 600;
  background-color: #DAA520;
  color: #000;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const profileInfoStyle = css`
  display: flex;
  flex-direction: column;
`

// Empty State Styles
const emptyStateContainerStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  padding: 40px 20px;
`

const emptyStateCardStyle = css`
  background: linear-gradient(135deg, #1a1a1a 0%, #252525 100%);
  border-radius: 20px;
  padding: 60px 40px;
  max-width: 800px;
  width: 100%;
  border: 1px solid #2a2a2a;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
`

const iconContainerStyle = css`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
`

const iconStyle = css`
  width: 80px;
  height: 80px;
  color: #DAA520;
  opacity: 0.9;
`

const emptyStateTitleStyle = css`
  font-size: 32px;
  font-weight: 700;
  color: #DAA520;
  margin: 0 0 20px 0;
`

const emptyStateDescriptionStyle = css`
  font-size: 16px;
  color: #aaa;
  line-height: 1.6;
  margin: 0 0 40px 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`

const actionsContainerStyle = css`
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 50px;
`

const primaryButtonStyle = css`
  background-color: #DAA520;
  color: #000;
  border: none;
  padding: 14px 32px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #C8941D;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(218, 165, 32, 0.4);
  }
`

const secondaryButtonStyle = css`
  background-color: transparent;
  color: #DAA520;
  border: 2px solid #DAA520;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: rgba(218, 165, 32, 0.1);
    transform: translateY(-2px);
  }
`

const buttonIconStyle = css`
  width: 20px;
  height: 20px;
`

const featuresContainerStyle = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-top: 20px;
`

const featureItemStyle = css`
  text-align: center;
`

const featureIconStyle = css`
  font-size: 40px;
  margin-bottom: 15px;
`

const featureTitleStyle = css`
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0 0 10px 0;
`

const featureDescStyle = css`
  font-size: 14px;
  color: #888;
  line-height: 1.5;
  margin: 0;
`

// No Results Styles
const noResultsContainerStyle = css`
  text-align: center;
  padding: 80px 20px;
`

const noResultsIconStyle = css`
  width: 64px;
  height: 64px;
  color: #666;
  margin: 0 auto 20px;
`

const noResultsTitleStyle = css`
  font-size: 24px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0 0 10px 0;
`

const noResultsDescStyle = css`
  font-size: 16px;
  color: #888;
  margin: 0 0 30px 0;
`

const browseButtonStyle = css`
  background-color: #DAA520;
  color: #000;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #C8941D;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(218, 165, 32, 0.3);
  }
`

// Error Styles
const errorContainerStyle = css`
  text-align: center;
  padding: 80px 20px;
`

const errorIconStyle = css`
  width: 64px;
  height: 64px;
  color: #ff6b6b;
  margin: 0 auto 20px;
`

const errorTitleStyle = css`
  font-size: 24px;
  font-weight: 600;
  color: #ff6b6b;
  margin: 0 0 10px 0;
`

const errorDescStyle = css`
  font-size: 16px;
  color: #888;
  margin: 0 0 30px 0;
`

const retryButtonStyle = css`
  background-color: #ff6b6b;
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #ff5252;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
  }
`
