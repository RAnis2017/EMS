import { Subject } from 'rxjs';

const subject = new Subject();

export const deniedAlertService = {
    sendDeniedAlert: message => subject.next({ text: message }),
    clearDeniedAlert: () => subject.next(),
    onDeniedAlert: () => subject.asObservable()
};

const resourceAction = {
    createPost: 'Create Post',
    updatePost: 'Update Post',
    deletePost: 'Delete Post',
    createCategory: 'Create Category',
    updateCategory: 'Update Category',
    deleteCategory: 'Delete Category',
    readPost: 'Read Post',
    readCategory: 'Read Category',
    readAllPosts: 'Read All Posts',
    readAllCategories: 'Read All Categories',
    changeStatus: 'Change Status',
    readAllUsers: 'Read All Users',
    readAllPermissions: 'Read All Permissions',
    updateUserPermissions: 'Update User Permissions',
    default: 'Performed',
}

export const fetchFunc = (url, method, headers, data, navigate, action = null) =>
    fetch(url, {
        method,
        headers,
        body: data
    }).then(res => {
        if (res.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('email')
            if(navigate) {
                navigate('/')
            }
        }

        if(res.status === 403) {
            deniedAlertService.sendDeniedAlert(`You are not authorized to access the ${resourceAction[action ? action : 'default']} action.`)
        }
        
        return res.json()
    }
    )

export const dateFormater = (date) => {
    const dateObj = new Date(date)
    return `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`
}

export const timeFormater = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
}