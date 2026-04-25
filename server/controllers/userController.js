const { User } = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateJWT = (login, role) => {
    return jwt.sign({ login, role }, process.env.SECRET_KEY, { expiresIn: '24h' });
};

class UserController {
    async login(req, res) {
        try {
            const { login, password } = req.body;
            const candidate = await User.findOne({ where: { login } });
            if (!candidate) {
                return res.status(401).json({ message: 'Не найден' });
            }
            const matchPassword = await bcrypt.compare(password, candidate.password);
            if (!matchPassword) {
                return res.status(401).json({ message: 'Неправильный пароль' });
            }
            const token = generateJWT(candidate.login, candidate.role);
            return res.status(200).json({ token, user: {                 
                id: candidate.id,
                login: candidate.login,
                role: candidate.role} 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async register(req, res) {
        try {
            const { login, password, role } = req.body;
            const candidate = await User.findOne({ where: { login } });
            if (candidate) {
                return res.status(400).json({ message: 'Такой пользователь уже зарегистрирован' });
            }
            const hashedPassword = await bcrypt.hash(password, parseInt(process.env.PASSWORD_SALT) || 8);
            const user = await User.create({ login, password: hashedPassword, role: role || 'USER' });
            const token = generateJWT(user.login, user.role);
            return res.status(200).json({ token, user:{
                id: user.id,
                login: user.login,
                role: user.role
            } });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async getAll(req,res) {
        const users = await User.findAll();
        return res.send(users)
    }
}

module.exports = new UserController();
