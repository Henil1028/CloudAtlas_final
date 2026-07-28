const User = require('../models/User');
const { generateToken } = require('../services/tokenService');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Configure email transporter
const getTransporter = async () => {
  // If SMTP user is provided and it's a Gmail address or service is gmail
  if (process.env.SMTP_SERVICE === 'gmail' || (process.env.SMTP_USER && process.env.SMTP_USER.includes('gmail.com'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // App Password
      },
    });
  }

  // If SMTP config is provided in env, use it
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // Otherwise, fallback to Ethereal Email test account for development
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    // If even that fails (offline), return null, we will just console.log the OTP
    return null;
  }
};

// Send SMS message helper using Twilio
const sendSMS = async (to, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  console.log('\n========================================');
  console.log(`💬 [SMS Simulated Message] for ${to}`);
  console.log(`Text: Your CloudAtlas AI OTP code is: ${otp}. It is valid for 60 seconds.`);
  console.log('========================================\n');

  if (accountSid && authToken && fromNumber) {
    try {
      const axios = require('axios');
      let formattedTo = to;
      if (!formattedTo.startsWith('+')) {
        formattedTo = '+' + formattedTo;
      }
      
      const params = new URLSearchParams();
      params.append('To', formattedTo);
      params.append('From', fromNumber);
      params.append('Body', `Your CloudAtlas AI OTP code is: ${otp}. It is valid for 60 seconds.`);

      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        params,
        {
          auth: {
            username: accountSid,
            password: authToken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      console.log(`✅ [Twilio SMS] Message sent to ${formattedTo}`);
      return true;
    } catch (err) {
      console.error('❌ Twilio SMS send error:', err.response?.data || err.message);
      return false;
    }
  }

  return false;
};

// Send WhatsApp message helper
const sendWhatsApp = async (to, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

  console.log('\n========================================');
  console.log(`💬 [WhatsApp Simulated Message] for ${to}`);
  console.log(`Text: Your CloudAtlas AI OTP code is: ${otp}. It is valid for 60 seconds.`);
  console.log('========================================\n');

  if (accountSid && authToken && fromNumber) {
    try {
      const axios = require('axios');
      let formattedTo = to;
      if (!formattedTo.startsWith('+')) {
        formattedTo = '+' + formattedTo;
      }
      
      const params = new URLSearchParams();
      params.append('To', `whatsapp:${formattedTo}`);
      params.append('From', `whatsapp:${fromNumber}`);
      params.append('Body', `Your CloudAtlas AI OTP code is: ${otp}. It is valid for 60 seconds.`);

      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        params,
        {
          auth: {
            username: accountSid,
            password: authToken
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      console.log(`✅ [Twilio WhatsApp] Message sent to ${formattedTo}`);
      return true;
    } catch (err) {
      console.error('❌ Twilio WhatsApp send error:', err.response?.data || err.message);
      return false;
    }
  }

  const ultraInstance = process.env.ULTRAMSG_INSTANCE_ID;
  const ultraToken = process.env.ULTRAMSG_TOKEN;
  if (ultraInstance && ultraToken) {
    try {
      const axios = require('axios');
      await axios.post(`https://api.ultramsg.com/${ultraInstance}/messages/chat`, {
        token: ultraToken,
        to: to,
        body: `Your CloudAtlas AI OTP code is: ${otp}. It is valid for 60 seconds.`
      });
      console.log(`✅ [Ultramsg WhatsApp] Message sent to ${to}`);
      return true;
    } catch (err) {
      console.error('❌ Ultramsg WhatsApp send error:', err.response?.data || err.message);
      return false;
    }
  }

  return false;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, secretCode } = req.body;

    // Strict input validation
    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, phone number, and password.' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long.' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address (e.g. user@example.com).' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits (e.g., 9876543210).' });
    }

    // Validate registration secret code
    const adminSecret = process.env.REGISTRATION_SECRET || 'ATLAS-ADMIN-99';
    if (secretCode && secretCode !== adminSecret) {
      console.log(`⚠️ User registered with mismatching/unverified key: ${secretCode}`);
    }

    // Check if user already exists (by email or phone number)
    const userExists = await User.findOne({
      $or: [
        { email: cleanEmail },
        { phoneNumber: cleanPhone }
      ]
    });
    
    if (userExists) {
      // If user exists but is not active (pending OTP), allow registering/updating details and sending a new OTP
      if (!userExists.isActive) {
        userExists.name = name.trim();
        userExists.password = password;
        const isAdmin = (secretCode === adminSecret);
        userExists.role = isAdmin ? 'super_admin' : 'user';

        if (isAdmin) {
          userExists.isActive = true;
          userExists.registrationOtp = undefined;
          userExists.registrationOtpExpires = undefined;
          await userExists.save();

          const token = generateToken(userExists._id, userExists.role);
          return res.status(200).json({
            _id: userExists._id,
            name: userExists.name,
            email: userExists.email,
            phoneNumber: userExists.phoneNumber,
            role: userExists.role,
            token,
            message: 'Super Admin activated! Direct access granted.'
          });
        }
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
        userExists.registrationOtp = hashedOtp;
        userExists.registrationOtpExpires = Date.now() + 5 * 60 * 1000;
        await userExists.save();

        console.log('\n========================================');
        console.log(`🔑 [REGISTRATION OTP] for ${cleanEmail}: ${otp}`);
        console.log('========================================\n');

        // Send Email OTP
        const transporter = await getTransporter();
        if (transporter) {
          const mailOptions = {
            from: '"CloudAtlas AI Security" <security@cloudatlas.ai>',
            to: userExists.email,
            subject: 'CloudAtlas AI - Registration OTP Verification',
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #22C55E; text-align: center;">CloudAtlas AI</h2>
                <p>Hello ${name},</p>
                <p>Welcome to CloudAtlas AI! Please verify your account using the OTP code below:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f0f0f0; padding: 10px 20px; border-radius: 5px; border: 1px dashed #ccc;">
                    ${otp}
                  </span>
                </div>
                <p style="color: #666; font-size: 12px; text-align: center;">This code is valid for 5 minutes. If you did not sign up for this account, please ignore this email.</p>
              </div>
            `,
          };
          transporter.sendMail(mailOptions, (error) => {
            if (error) console.error('Registration Mail Error:', error.message);
          });
        }

        // Send SMS/WhatsApp OTP
        await sendSMS(userExists.phoneNumber, otp);
        await sendWhatsApp(userExists.phoneNumber, otp);

        return res.status(200).json({
          status: 'pending_verification',
          email: userExists.email,
          ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
          message: 'Verification OTP sent to your email and phone number'
        });
      }

      if (userExists.email === cleanEmail) {
        return res.status(400).json({ message: 'An account with this email address already exists. Please log in.' });
      } else {
        return res.status(400).json({ message: 'An account with this phone number already exists. Please log in.' });
      }
    }

    // Assign role based on secret code
    const isAdmin = (secretCode === adminSecret);

    // If Super Admin attempt, verify if an admin already exists (Only 1 Admin Allowed)
    if (isAdmin) {
      const existingAdmin = await User.findOne({ role: 'super_admin' });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Registration Denied: Only 1 Super Admin account is allowed in the system. An admin already exists.' });
      }

      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        phoneNumber: cleanPhone,
        password,
        role: 'super_admin',
        isActive: true
      });

      const token = generateToken(user._id, user.role);

      console.log(`\n👑 [SINGLE SUPER ADMIN REGISTERED] ${cleanEmail} - Instant access granted (No OTP required)\n`);

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token,
        message: 'Super Admin registered successfully! Direct access granted.'
      });
    }

    // Standard User: Generate 6-digit OTP for registration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Create inactive user for standard verification flow
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phoneNumber: cleanPhone,
      password,
      role: 'user',
      isActive: false,
      registrationOtp: hashedOtp,
      registrationOtpExpires: Date.now() + 120 * 1000 // 2 minutes (120 seconds)
    });

    if (user) {
      console.log('\n========================================');
      console.log(`🔑 [REGISTRATION OTP] for ${cleanEmail}: ${otp}`);
      console.log('========================================\n');

      // Send Email OTP
      const transporter = await getTransporter();
      if (transporter) {
        const mailOptions = {
          from: '"CloudAtlas AI Security" <security@cloudatlas.ai>',
          to: user.email,
          subject: 'CloudAtlas AI - Registration OTP Verification',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #22C55E; text-align: center;">CloudAtlas AI</h2>
              <p>Hello ${name},</p>
              <p>Welcome to CloudAtlas AI! Please verify your account using the OTP code below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f0f0f0; padding: 10px 20px; border-radius: 5px; border: 1px dashed #ccc;">
                  ${otp}
                </span>
              </div>
              <p style="color: #666; font-size: 12px; text-align: center;">This code is valid for 5 minutes. If you did not sign up for this account, please ignore this email.</p>
            </div>
          `,
        };
        transporter.sendMail(mailOptions, (error) => {
          if (error) console.error('Registration Mail Error:', error.message);
        });
      }

      // Send SMS/WhatsApp OTP
      await sendSMS(user.phoneNumber, otp);
      await sendWhatsApp(user.phoneNumber, otp);

      res.status(201).json({
        status: 'pending_verification',
        email: user.email,
        ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
        message: 'Verification OTP sent to your email and phone number'
      });
    } else {
      res.status(400).json({ message: 'Invalid user registration data' });
    }
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email/phone and password.' });
    }

    const cleanQuery = email.trim().toLowerCase();

    // Check for user by email OR phoneNumber
    const user = await User.findOne({
      $or: [
        { email: cleanQuery },
        { phoneNumber: email.trim() }
      ]
    }).select('+password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User account not found.' });
    }

    // Check if account is active (verified) - Super Admins bypass OTP verification
    if (!user.isActive && user.role !== 'super_admin') {
      return res.status(401).json({ 
        message: 'Account is unverified. Please complete OTP verification first.',
        unverified: true,
        email: user.email
      });
    }

    // Auto-activate Super Admin if needed
    if (!user.isActive && user.role === 'super_admin') {
      user.isActive = true;
      await user.save();
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password is incorrect.' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// @desc    Request Password Reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body; // Can be email or phone number
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address or phone number' });
    }

    const isEmail = email.includes('@');
    let user;
    if (isEmail) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = await User.findOne({ phoneNumber: email });
    }

    if (!user) {
      // High Security: Return generic success message to prevent email harvesting / user enumeration
      return res.json({ message: 'If this email or phone number is registered, an OTP has been sent. Please check your inbox or server logs.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpires = Date.now() + 120 * 1000; // 2 minutes (120 seconds)
    user.resetPasswordOtpAttempts = 0; // Reset brute force counter
    await user.save();

    // Print OTP in Node console so testing is never blocked in dev mode
    console.log('\n========================================');
    console.log(`🔑 [OTP Verification Code] for ${email}: ${otp}`);
    console.log('========================================\n');

    if (isEmail) {
      // Send email via Nodemailer
      const transporter = await getTransporter();
      if (transporter) {
        const mailOptions = {
          from: '"CloudAtlas AI Security" <security@cloudatlas.ai>',
          to: user.email,
          subject: 'CloudAtlas AI - Reset Password OTP',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #00D4FF; text-align: center;">CloudAtlas AI</h2>
              <p>Hello,</p>
              <p>You requested an OTP to reset your password. Please use the verification code below to proceed:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f0f0f0; padding: 10px 20px; border-radius: 5px; border: 1px dashed #ccc;">
                  ${otp}
                </span>
              </div>
              <p style="color: #666; font-size: 12px; text-align: center;">This code will expire in 60 seconds. If you did not request this, please ignore this email.</p>
            </div>
          `,
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Mail Send Error:', error.message);
          } else {
            // If using ethereal test account, log URL to preview email
            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) {
              console.log(`📧 [Ethereal Mail Preview URL]: ${previewUrl}`);
            }
          }
        });
      }
      res.json({ message: 'OTP sent successfully. Please check your inbox or server logs.' });
    } else {
      // Send SMS and WhatsApp
      await sendSMS(user.phoneNumber, otp);
      await sendWhatsApp(user.phoneNumber, otp);
      res.json({ message: 'OTP sent successfully via SMS and WhatsApp. Please check your phone or server logs.' });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error during forgot password request' });
  }
};

// @desc    Verify OTP and Reset Password
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const isEmail = email.includes('@');
    let user;
    if (isEmail) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    } else {
      user = await User.findOne({ phoneNumber: email }).select('+password');
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset request' });
    }

    // Check expiry first
    if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < Date.now()) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpires = undefined;
      user.resetPasswordOtpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'OTP code has expired. Please request a new one.' });
    }

    // Hash entered OTP and check match
    const hashedEnteredOtp = crypto.createHash('sha256').update(otp).digest('hex');
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== hashedEnteredOtp) {
      user.resetPasswordOtpAttempts = (user.resetPasswordOtpAttempts || 0) + 1;
      
      if (user.resetPasswordOtpAttempts >= 3) {
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpires = undefined;
        user.resetPasswordOtpAttempts = 0;
        await user.save();
        return res.status(400).json({ message: 'Too many failed attempts. Reset session locked, please request a new OTP.' });
      }
      
      await user.save();
      const attemptsLeft = 3 - user.resetPasswordOtpAttempts;
      return res.status(400).json({ message: `Invalid OTP code. ${attemptsLeft} attempts remaining.` });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.resetPasswordOtpAttempts = 0;
    await user.save();

    console.log(`\n✅ [PASSWORD RESET SUCCESSFUL] Updated password in database for: ${user.email}\n`);

    res.json({ message: 'Password has been reset successfully. You can now login.' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

// @desc    Verify OTP only (step 2 of recovery)
// @route   POST /api/auth/verify-otp-only
// @access  Public
const verifyOtpOnly = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const isEmail = email.includes('@');
    let user;
    if (isEmail) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = await User.findOne({ phoneNumber: email });
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset request' });
    }

    // Check expiry first
    if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < Date.now()) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpires = undefined;
      user.resetPasswordOtpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'OTP code has expired. Please request a new one.' });
    }

    // Hash entered OTP and check match
    const hashedEnteredOtp = crypto.createHash('sha256').update(otp).digest('hex');
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== hashedEnteredOtp) {
      user.resetPasswordOtpAttempts = (user.resetPasswordOtpAttempts || 0) + 1;
      
      if (user.resetPasswordOtpAttempts >= 3) {
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpires = undefined;
        user.resetPasswordOtpAttempts = 0;
        await user.save();
        return res.status(400).json({ message: 'Too many failed attempts. Reset session locked, please request a new OTP.' });
      }
      
      await user.save();
      const attemptsLeft = 3 - user.resetPasswordOtpAttempts;
      return res.status(400).json({ message: `Invalid OTP code. ${attemptsLeft} attempts remaining.` });
    }

    // OTP is correct! Do not delete it yet, we need it to reset password in step 3
    res.json({ message: 'OTP verified successfully. You can now set a new password.' });
  } catch (error) {
    console.error('Verify OTP Only Error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

// @desc    Create a user (Admin only)
// @route   POST /api/auth/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, role } = req.body;
    
    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, phone number, and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');

    const exists = await User.findOne({
      $or: [
        { email: cleanEmail },
        { phoneNumber: cleanPhone }
      ]
    });

    if (exists) {
      return res.status(400).json({ message: 'An account with this email address or phone number already exists.' });
    }

    // Admin created users are automatically active (isActive: true) for immediate login
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phoneNumber: cleanPhone,
      password,
      role: role || 'user',
      isActive: true
    });

    console.log(`\n👤 [ADMIN CREATED USER] ${cleanEmail} - Activated for immediate direct login.\n`);

    res.status(201).json(user);
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ message: error.message || 'Server error creating user' });
  }
};

// @desc    Update user details (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, role, isActive } = req.body;
    const updatePayload = {
      name: name ? name.trim() : undefined,
      email: email ? email.trim().toLowerCase() : undefined,
      phoneNumber: phoneNumber ? phoneNumber.trim().replace(/\s+/g, '') : undefined,
      role
    };

    if (isActive !== undefined) {
      updatePayload.isActive = isActive;
    }

    if (password && password.trim().length >= 8) {
      const salt = await bcrypt.genSalt(12);
      updatePayload.password = await bcrypt.hash(password.trim(), salt);
    }

    // Clean undefined keys
    Object.keys(updatePayload).forEach(key => updatePayload[key] === undefined && delete updatePayload[key]);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    if (userToDelete.role === 'super_admin') {
      return res.status(403).json({ message: 'Action Prohibited: The Super Admin account cannot be deleted.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User account deleted successfully.' });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
};

// @desc    Verify Registration OTP
// @route   POST /api/auth/verify-registration
// @access  Public
const verifyRegistration = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification request' });
    }

    if (user.isActive) {
      return res.status(400).json({ message: 'Account is already active. Please log in.' });
    }

    // Check attempt count (max 5 attempts)
    const currentAttempts = user.registrationOtpAttempts || 0;
    if (currentAttempts >= 5) {
      return res.status(400).json({ 
        message: 'Maximum OTP verification attempts (5) reached. Please click "Resend Code" to receive a new OTP.',
        maxAttemptsReached: true
      });
    }

    if (!user.registrationOtpExpires || user.registrationOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please click "Resend Code" to receive a new OTP.' });
    }

    const hashedOtp = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    if (user.registrationOtp !== hashedOtp) {
      const updatedAttempts = currentAttempts + 1;
      user.registrationOtpAttempts = updatedAttempts;
      await user.save();

      const attemptsLeft = Math.max(0, 5 - updatedAttempts);
      if (updatedAttempts >= 5) {
        return res.status(400).json({ 
          message: 'Maximum verification attempts (5) exceeded. Please request a new OTP by clicking "Resend Code".',
          maxAttemptsReached: true,
          attemptsLeft: 0
        });
      }
      return res.status(400).json({ 
        message: `Incorrect 6-digit OTP code. You have ${attemptsLeft} attempt(s) remaining.`,
        attemptsLeft 
      });
    }

    // Activate user upon correct OTP
    user.isActive = true;
    user.registrationOtp = undefined;
    user.registrationOtpExpires = undefined;
    user.registrationOtpAttempts = 0;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Verify Registration Error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// @desc    Resend Registration OTP
// @route   POST /api/auth/resend-registration-otp
// @access  Public
const resendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isActive) {
      return res.status(400).json({ message: 'Account is already verified. Please log in.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    user.registrationOtp = hashedOtp;
    user.registrationOtpExpires = Date.now() + 120 * 1000; // 2 minutes (120 seconds)
    user.registrationOtpAttempts = 0; // Reset attempts on resend
    await user.save();

    console.log('\n========================================');
    console.log(`🔑 [RESEND REGISTRATION OTP] for ${email}: ${otp}`);
    console.log('========================================\n');

    // Send Email
    const transporter = await getTransporter();
    if (transporter) {
      const mailOptions = {
        from: '"CloudAtlas AI Security" <security@cloudatlas.ai>',
        to: user.email,
        subject: 'CloudAtlas AI - Resend Registration OTP',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #22C55E; text-align: center;">CloudAtlas AI</h2>
            <p>Hello ${user.name},</p>
            <p>Verify your account using your new registration code:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f0f0f0; padding: 10px 20px; border-radius: 5px; border: 1px dashed #ccc;">
                ${otp}
              </span>
            </div>
            <p style="color: #666; font-size: 12px; text-align: center;">This code will expire in 5 minutes.</p>
          </div>
        `,
      };
      transporter.sendMail(mailOptions, (error) => {
        if (error) console.error('Resend Mail Error:', error.message);
      });
    }

    // Send SMS / WhatsApp
    await sendSMS(user.phoneNumber, otp);
    await sendWhatsApp(user.phoneNumber, otp);

    res.json({
      message: 'Verification OTP resent successfully.',
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ message: 'Server error resending verification code' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  verifyOtp,
  verifyOtpOnly,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  verifyRegistration,
  resendRegistrationOtp,
};
