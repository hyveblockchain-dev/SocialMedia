import { createClient as createUrqlClient } from 'urql'

export const APIURL = "https://api.lens.dev"
export const STORAGE_KEY = "LH_STORAGE_KEY"

// Import all queries
export { 
  recommendedProfiles,
  getProfiles,
  getDefaultProfile,
  getPublications,
  searchProfiles,
  searchPublications,
  explorePublications,
  doesFollow,
  getChallenge,
  timeline
} from './queries'

// Import all mutations  
export {
  followUser,
  authenticate,
  refresh,
  createUnfollowTypedData,
  createFollowTypedData,
  broadcast,
  createPostTypedData,
  createProfileMetadataTypedData
} from './mutations'

// Create basic client for non-authenticated requests
export const basicClient = createUrqlClient({
  url: APIURL
})

// Function to get auth token from local storage
function getAuthenticationToken() {
  if (typeof window === 'undefined') return null
  
  const storageData = localStorage.getItem(STORAGE_KEY)
  if (!storageData) return null
  
  try {
    const { accessToken, exp } = JSON.parse(storageData)
    const now = Date.now() / 1000
    
    // Token expired, return null
    if (now > exp) {
      return null
    }
    
    return accessToken
  } catch (err) {
    console.log('Error parsing storage data:', err)
    return null
  }
}

// Create authenticated client
export async function createClient() {
  const accessToken = getAuthenticationToken()
  
  if (!accessToken) {
    return basicClient
  }

  const urqlClient = createUrqlClient({
    url: APIURL,
    fetchOptions: {
      headers: {
        'x-access-token': `Bearer ${accessToken}`
      },
    },
  })

  return urqlClient
}
