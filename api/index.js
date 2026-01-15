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
      
      <div className={listItemContainerStyle}>
        {
          loadingState === 'no-results' && (
            <h2 style={{marginTop: 50}}>No results....</h2>
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
            <div>
              <h2 style={{marginTop: 50, color: '#ff6b6b'}}>Error loading posts</h2>
              <p style={{marginTop: 20}}>Please try refreshing the page or connect your wallet.</p>
            </div>
          )
        }
        {
          posts.map((post, index) => (
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
