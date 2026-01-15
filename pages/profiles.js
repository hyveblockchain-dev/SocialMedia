import { useState, useEffect } from 'react'
import { css } from '@emotion/css'
import { Button, SearchInput, Placeholders } from '../components'
import Link from 'next/link'

export default function Profiles() {
  const [profiles, setProfiles] = useState([])
  const [searchString, setSearchString] = useState('')
  const [loadingState, setLoadingState] = useState('loaded') // Start as loaded to show welcome screen

  // For now, just show the welcome screen since the API is broken
  // Once API is fixed, we can uncomment the fetch logic

  /*
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
  */

  async function searchForProfile() {
    if (!searchString.trim()) {
      setProfiles([])
      setLoadingState('loaded')
      return
    }

    // TODO: Implement search when API is fixed
    setLoadingState('no-results')
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

      {/* Welcome/Empty State */}
      {loadingState === 'loaded' && profiles.length === 0 && !searchString && (
        <div className={emptyStateContainerStyle}>
          <div className={emptyStateCardStyle}>
            <div className={iconContainerStyle}>
              <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            
            <h2 className={emptyStateTitleStyle}>
              Discover Profiles on Lens Protocol
            </h2>
            
            <p className={emptyStateDescriptionStyle}>
              Search for profiles by name or handle to discover people in the decentralized social network. Connect your wallet to follow users and build your network!
            </p>
            
            <div className={searchTipsStyle}>
              <h3 className={tipsTitleStyle}>Search Tips:</h3>
              <div className={tipsGridStyle}>
                <div className={tipItemStyle}>
                  <div className={tipIconStyle}>🔍</div>
                  <p>Enter a username to find profiles</p>
                </div>
                <div className={tipItemStyle}>
                  <div className={tipIconStyle}>@</div>
                  <p>Search by handle (e.g., @username)</p>
                </div>
                <div className={tipItemStyle}>
                  <div className={tipIconStyle}>✨</div>
                  <p>Discover creators and communities</p>
                </div>
              </div>
            </div>
            
            <div className={featuresContainerStyle}>
              <div className={featureItemStyle}>
                <div className={featureIconStyle}>🌐</div>
                <h4 className={featureTitleStyle}>Decentralized Profiles</h4>
                <p className={featureDescStyle}>Each profile is owned by its creator on the blockchain.</p>
              </div>
              <div className={featureItemStyle}>
                <div className={featureIconStyle}>🔗</div>
                <h4 className={featureTitleStyle}>Web3 Identity</h4>
                <p className={featureDescStyle}>Connect with your crypto wallet to interact with profiles.</p>
              </div>
              <div className={featureItemStyle}>
                <div className={featureIconStyle}>👥</div>
                <h4 className={featureTitleStyle}>Build Your Network</h4>
                <p className={featureDescStyle}>Follow, engage, and grow your decentralized community.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results or No Results */}
      {loadingState === 'no-results' && (
        <div className={noResultsContainerStyle}>
          <svg className={noResultsIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className={noResultsTitleStyle}>No profiles found</h2>
          <p className={noResultsDescStyle}>Try searching for a different name or handle. The profile search feature will be fully functional once the API is configured.</p>
        </div>
      )}

      {/* Loading States */}
      {loadingState === 'loading' && (
        <div className={loadingContainerStyle}>
          <Placeholders number={9} />
        </div>
      )}

      {loadingState === 'searching' && (
        <div className={loadingContainerStyle}>
          <Placeholders number={6} />
        </div>
      )}

      {/* Error State */}
      {loadingState === 'error' && (
        <div className={errorContainerStyle}>
          <svg className={errorIconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 style={{color: '#ff6b6b'}}>Error loading profiles</h3>
          <p>Please try again or refresh the page</p>
        </div>
      )}

      {/* Profile Results Grid */}
      {loadingState === 'loaded' && profiles.length > 0 && (
        <div>
          <div className={headerStyle}>
            <h2 className={titleStyle}>Search Results</h2>
            <p className={subtitleStyle}>{profiles.length} profiles</p>
          </div>

          <div className={profilesContainerStyle}>
            {profiles.map((profile, index) => (
              <Link href={`/profile/${profile.id}`} key={index}>
                <a>
                  <div className={profileCardStyle}>
                    <div className={profileImageContainerStyle}>
                      {profile.picture && profile.picture.original ? (
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
                      )}
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
            ))}
          </div>
        </div>
      )}
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
  max-width: 900px;
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
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`

const searchTipsStyle = css`
  margin-bottom: 50px;
`

const tipsTitleStyle = css`
  font-size: 20px;
  font-weight: 600;
  color: #e0e0e0;
  margin: 0 0 25px 0;
`

const tipsGridStyle = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 700px;
  margin: 0 auto;
`

const tipItemStyle = css`
  background-color: rgba(218, 165, 32, 0.1);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(218, 165, 32, 0.2);
  
  p {
    margin: 10px 0 0 0;
    font-size: 14px;
    color: #aaa;
  }
`

const tipIconStyle = css`
  font-size: 32px;
  margin-bottom: 5px;
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
  margin: 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`

// Loading Styles
const loadingContainerStyle = css`
  padding: 40px 20px;
`

// Error Styles
const errorContainerStyle = css`
  text-align: center;
  padding: 80px 20px;
  
  h3 {
    margin: 20px 0 10px 0;
    font-size: 24px;
  }
  
  p {
    margin: 0;
    color: #888;
    font-size: 16px;
  }
`

const errorIconStyle = css`
  width: 64px;
  height: 64px;
  color: #ff6b6b;
  margin: 0 auto;
`
