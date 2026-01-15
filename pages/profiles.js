import { useState, useEffect } from 'react'
import { css } from '@emotion/css'
import { basicClient, recommendedProfiles, searchProfiles } from '../api'
import { Button, SearchInput, Placeholders } from '../components'
import Link from 'next/link'

export default function Profiles() {
  const [profiles, setProfiles] = useState([])
  const [searchString, setSearchString] = useState('')
  const [loadingState, setLoadingState] = useState('loading')

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    try {
      setLoadingState('loading')
      const response = await basicClient.query(recommendedProfiles).toPromise()
      
      const profileData = response.data.recommendedProfiles.map(profile => {
        // Process profile pictures
        if (profile.picture && profile.picture.original && profile.picture.original.url) {
          if (profile.picture.original.url.startsWith('ipfs://')) {
            let result = profile.picture.original.url.substring(7, profile.picture.original.url.length)
            profile.picture.original.url = `http://lens.infura-ipfs.io/ipfs/${result}`
          }
        }
        
        // Add random background color for placeholders
        profile.backgroundColor = generateRandomColor()
        return profile
      })
      
      setProfiles(profileData)
      setLoadingState('loaded')
    } catch (err) {
      console.log('Error fetching profiles:', err)
      setLoadingState('error')
    }
  }

  async function searchForProfile() {
    if (!searchString.trim()) {
      fetchProfiles()
      return
    }

    try {
      setLoadingState('searching')
      const response = await basicClient.query(searchProfiles, {
        query: searchString
      }).toPromise()
      
      const profileData = response.data.search.items.filter(item => item.__typename === 'Profile')
      
      if (profileData.length === 0) {
        setLoadingState('no-results')
        setProfiles([])
        return
      }

      const processedProfiles = profileData.map(profile => {
        if (profile.picture && profile.picture.original && profile.picture.original.url) {
          if (profile.picture.original.url.startsWith('ipfs://')) {
            let result = profile.picture.original.url.substring(7, profile.picture.original.url.length)
            profile.picture.original.url = `http://lens.infura-ipfs.io/ipfs/${result}`
          }
        }
        profile.backgroundColor = generateRandomColor()
        return profile
      })
      
      setProfiles(processedProfiles)
      setLoadingState('loaded')
    } catch (err) {
      console.log('Error searching profiles:', err)
      setLoadingState('error')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      searchForProfile()
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
          placeholder='Search profiles'
          onChange={e => setSearchString(e.target.value)}
          value={searchString}
          onKeyDown={handleKeyDown}
        />
        <Button
          buttonText="SEARCH PROFILES"
          onClick={searchForProfile}
        />
      </div>

      <div className={headerStyle}>
        <h2 className={titleStyle}>
          {searchString ? 'Search Results' : 'Recommended Profiles'}
        </h2>
        <p className={subtitleStyle}>
          {loadingState === 'loaded' && `${profiles.length} profiles`}
        </p>
      </div>

      <div className={profilesContainerStyle}>
        {
          loadingState === 'loading' && <Placeholders number={9} />
        }
        {
          loadingState === 'searching' && <Placeholders number={6} />
        }
        {
          loadingState === 'no-results' && (
            <div className={noResultsStyle}>
              <h3>No profiles found</h3>
              <p>Try searching for a different name or handle</p>
              <button onClick={fetchProfiles} className={resetButtonStyle}>
                Show Recommended Profiles
              </button>
            </div>
          )
        }
        {
          loadingState === 'error' && (
            <div className={errorContainerStyle}>
              <h3 style={{color: '#ff6b6b'}}>Error loading profiles</h3>
              <p>Please try again or refresh the page</p>
              <button onClick={fetchProfiles} className={retryButtonStyle}>
                Retry
              </button>
            </div>
          )
        }
        {
          loadingState === 'loaded' && profiles.map((profile, index) => (
            <Link href={`/profile/${profile.id}`} key={index}>
              <a>
                <div className={profileCardStyle}>
                  <div className={profileImageContainerStyle}>
                    {
                      profile.picture && profile.picture.original ? (
                        <img 
                          src={profile.picture.original.url} 
                          className={profileImageStyle}
                          alt={profile.name || profile.handle}
                        />
                      ) : (
                        <div
                          className={css`
                            ${profilePlaceholderStyle};
                            background-color: ${profile.backgroundColor};
                          `}
                        />
                      )
                    }
                  </div>
                  
                  <div className={profileInfoStyle}>
                    <h3 className={profileNameStyle}>
                      {profile.name || 'Unnamed'}
                    </h3>
                    <p className={profileHandleStyle}>
                      @{profile.handle}
                    </p>
                    {profile.bio && (
                      <p className={profileBioStyle}>
                        {trimString(profile.bio, 100)}
                      </p>
                    )}
                    
                    <div className={profileStatsStyle}>
                      <div className={statStyle}>
                        <span className={statNumberStyle}>
                          {formatNumber(profile.stats?.totalFollowers || 0)}
                        </span>
                        <span className={statLabelStyle}>Followers</span>
                      </div>
                      <div className={statStyle}>
                        <span className={statNumberStyle}>
                          {formatNumber(profile.stats?.totalFollowing || 0)}
                        </span>
                        <span className={statLabelStyle}>Following</span>
                      </div>
                      <div className={statStyle}>
                        <span className={statNumberStyle}>
                          {formatNumber(profile.stats?.totalPosts || 0)}
                        </span>
                        <span className={statLabelStyle}>Posts</span>
                      </div>
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
  if (string.length <= length) return string
  return string.substring(0, length) + '...'
}

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const searchContainerStyle = css`
  padding: 40px 0px 30px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const headerStyle = css`
  margin-bottom: 30px;
  text-align: center;
`

const titleStyle = css`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #DAA520;
`

const subtitleStyle = css`
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #888;
`

const profilesContainerStyle = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  padding-bottom: 80px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const profileCardStyle = css`
  background-color: #1a1a1a;
  border-radius: 15px;
  padding: 25px;
  border: 1px solid #2a2a2a;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  &:hover {
    background-color: #252525;
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(218, 165, 32, 0.15);
    border-color: #DAA520;
  }
`

const profileImageContainerStyle = css`
  margin-bottom: 20px;
`

const profileImageStyle = css`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #DAA520;
`

const profilePlaceholderStyle = css`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #DAA520;
`

const profileInfoStyle = css`
  width: 100%;
`

const profileNameStyle = css`
  margin: 0 0 5px 0;
  font-size: 20px;
  font-weight: 600;
  color: #e0e0e0;
`

const profileHandleStyle = css`
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #DAA520;
`

const profileBioStyle = css`
  margin: 15px 0;
  font-size: 14px;
  color: #aaa;
  line-height: 1.5;
`

const profileStatsStyle = css`
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #2a2a2a;
`

const statStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const statNumberStyle = css`
  font-size: 18px;
  font-weight: 700;
  color: #DAA520;
  margin-bottom: 4px;
`

const statLabelStyle = css`
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const noResultsStyle = css`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 24px;
    color: #e0e0e0;
  }
  
  p {
    margin: 0 0 25px 0;
    color: #888;
    font-size: 16px;
  }
`

const errorContainerStyle = css`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 24px;
  }
  
  p {
    margin: 0 0 25px 0;
    color: #888;
    font-size: 16px;
  }
`

const resetButtonStyle = css`
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
  
  &:hover {
    background-color: #ff5252;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
  }
`
