/*
 * user.js
 */

export function createNew() {
  return {
    id:          undefined,
    name:        '',
    email:       '',
    password:    '',
    phone:       '',
    isAdmin:     false,
    permissions: [],
  }
}

export function deserialize(user) {
  return {
    id:          user.id,
    name:        user.name,
    email:       user.email,
    password:    user.password,
    phone:       user.phone,
    isAdmin:     user.isAdmin,
    permissions: JSON.stringify(user.permissions),
  }
}

export function serialize(user) {
  return {
    id:          user.id || undefined,
    name:        user.name || '',
    email:       user.email || '',
    password:    user.password || '',
    phone:       user.phone || '',
    isAdmin:     user.isAdmin || false,
    permissions: JSON.parse(user.permissions || '[]'),
  }
}

export function getDiffObject(previous, next) {
  const result = {
    id: next.id
  }
  for (let key in next) {
    if (JSON.stringify(previous[key]) !== JSON.stringify(next[key]))
      result[key] = next[key]
  }
  return result
}
