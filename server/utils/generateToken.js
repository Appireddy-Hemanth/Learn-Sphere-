import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });

    const isProd = process.env.NODE_ENV !== 'development';
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
};

export default generateToken;
