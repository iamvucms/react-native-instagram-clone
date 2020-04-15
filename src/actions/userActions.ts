import { userActionTypes } from "src/constants";
import { userAction } from '../reducers/userReducer'
export const LoginFailure = (): userAction => {
    return {
        type: userActionTypes.LOGIN_FAILURE,
        payload: {
            message: 'xxx'
        }
    }
}