import { createContext } from 'react';

export const UserContext = createContext({
  userInfo: {},
  setUserInfo: () => {}
});

export default UserContext;