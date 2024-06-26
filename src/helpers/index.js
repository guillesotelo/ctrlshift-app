import { LANGUAGES } from "../constants/languages"

export const getUserLanguage = () => {
    const localUser = JSON.parse(localStorage.getItem('user'))
    const navLang = (localUser && localUser.language) || navigator.language || navigator.userLanguage
    let userLang = 'en'
    LANGUAGES.forEach(appLang => {
        if (navLang.includes(appLang.code)) {
            userLang = appLang.code
        }
    })
    return userLang
}

export const sortArray = (arr, key, order) => {
    return arr.slice().sort((a, b) => {
        const aValue = a[key]
        const bValue = b[key]
        if (typeof aValue !== 'number' && !aValue) return 1
        if (typeof bValue !== 'number' && !bValue) return -1
        return order ? aValue < bValue ? 1 : -1 : aValue < bValue ? -1 : 1
    })
}