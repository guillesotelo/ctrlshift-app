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