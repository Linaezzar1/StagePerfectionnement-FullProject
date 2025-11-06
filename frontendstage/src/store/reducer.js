const initState = {
    isLogged: localStorage.getItem('token') ? true : false,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    currentUser : null,
    error: null
}

const mainReducer = (state = initState, action) => {
    switch (action.type) {
        case 'LOGIN': {
            localStorage.setItem('token', action.payload); // Save the token to localStorage
            return { ...state, isLogged: true, token: action.payload, error: null };
        }

        case 'LOGOUT':
            localStorage.removeItem('token'); // Remove the token from localStorage
            return { ...state, isLogged: false, token: null, error: null };

        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload };

        default:
            return state;
    }
}

export default mainReducer;