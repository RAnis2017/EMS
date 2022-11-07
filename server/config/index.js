module.exports = {
    port: 3001,
    db: {
        user: 'root',
        password: '',
        dbName: 'ems',
        port: '27017'
    },
    smtp: {
        MAIL_TYPE: 'log', // log, smtp
        USERNAME: process.env.MAIL_USERNAME,
        PASSWORD: process.env.MAIL_PASSWORD,
        OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID,
        OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
        OAUTH_REFRESH_TOKEN: process.env.OAUTH_REFRESH_TOKEN
    },
    TOKEN_KEY: 'longSecretKey',
    PERMISSIONS: {
        can_see_posts: ['get-posts', 'like-dislike-posts', 'create-tracking', 'airplane_crashes_data'],
        can_see_categories: ['get-categories'],
        can_admin_posts: ['add-post', 'update-post', 'delete-post', 'change-status'],
        can_admin_categories: ['add-category', 'update-category', 'delete-category'],
        can_admin_users: ['users', 'permissions', 'add-user-permission', 'get-trackings'],
    }
}