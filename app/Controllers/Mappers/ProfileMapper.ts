import User from 'App/Models/User'

export const getProfile = (user: User) => {
  return {
    profile: {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following: !!user.followers?.length,
    },
  }
}
