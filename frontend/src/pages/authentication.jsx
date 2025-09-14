import * as React from 'react';
import "./authentication.css";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';

const defaultTheme = createTheme();

export default function Authentication() {
    
    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const [name, setName] = React.useState();
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false)

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                let result = await handleLogin(username, password)
                setMessage("Login successful!");  // Add success message
                setOpen(true);   
            }

            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {
            console.log(err);
            let message = (err.response.data.message);
            setError(message);
        }
    }

    

    return (
        <div className="loginComponent">
            <div className='loginImage'>
                <img src="/images/login.svg" alt="Login Image" />
            </div>

                <ThemeProvider theme={defaultTheme}>
    <CssBaseline />
    
    <Grid 
        container 
        spacing={2} 
        columns={12} 
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
        {/* Right Side with Form */}
        <Grid 
    item 
    xs={12} 
    sm={8} 
    md={5} 
    sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 10  }}
>
<Box
    sx={{
        position: "relative",
        backgroundColor: "white",
        p: 3,
        borderRadius: 2,
        boxShadow: 3,
        width: "100%",
        maxWidth: 400,
        minHeight: 400, // 🔹 Same height for both forms
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        textAlign: "center",
    }}
    className="formBox"
>

        {/* Lock Icon Positioned */}
        <Avatar
            sx={{
                bgcolor: "secondary.main",
                width: 56,
                height: 56,
                position: "absolute",
                top: -28,
                left: "50%",
                transform: "translateX(-50%)",
            }}
        >
            <LockOutlinedIcon />
        </Avatar>

        {/* Sign In / Sign Up Toggle */}
        <Box sx={{ mt: 4, mb: 2 }}>
            <Button
                variant={formState === 0 ? "contained" : "outlined"}
                onClick={() => setFormState(0)}
                sx={{ mr: 1 }}
            >
                Sign In
            </Button>
            <Button
                variant={formState === 1 ? "contained" : "outlined"}
                onClick={() => setFormState(1)}
            >
                Sign Up
            </Button>
        </Box>

        {/* Form Fields */}
        <Box component="form" noValidate sx={{ mt: 1 }}>
            {formState === 1 && (
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            )}

            <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 1 }}
                onClick={handleAuth}
            >
                {formState === 0 ? "Sign In" : "Sign Up"}
            </Button>
        </Box>
    </Box>
</Grid>

    </Grid>
    <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
    />
</ThemeProvider>
<div className="themeProviderWrapper"></div>
            </div>

    );
}