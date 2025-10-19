import React, { useContext, useState, useEffect } from 'react'
import "./dashboard.css"
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, TextField, MenuItem } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';
import History from './history';
import MenuIcon from '@mui/icons-material/Menu';
import FeaturesSwiper from './Features';

function Home() {

    let navigate = useNavigate();

    const [meetingCode, setMeetingCode] = useState("");
    const [username, setUsername] = useState("");
const [menuOpen, setMenuOpen] = useState(false);
    const { getUsername, addToUserHistory} = useContext(AuthContext);


    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    
    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const name = await getUsername();
                setUsername(name);
            } catch {
                // IMPLEMENT SNACKBAR
            }
        }

        fetchUsername();
    }, [])

    return (
        <>

    <div className="navBar">
      {/* Logo */}
      <div className="navHeader" onClick={() => navigate("/")}>
        <img src="/images/logo.png" alt="Logo" style={{ width: "30px", marginRight: "8px" }} />
        <img src="/images/logo-name.png" alt="Logo Name" style={{ width: "200px" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        {/* Existing user info and logout - visible on large screens */}
        <img
          src="/images/user.png"
          alt="User  Profile"
          className="userProfile"
          style={{
            borderRadius: "50%",
            width: "35px",
            height: "30px",
          }}
        />
        <p className="username">{username}</p>
        <Button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/auth");
          }}
    className='LogoutButton'

        >
          Logout
        </Button>

        {/* Hamburger menu icon - visible only on small screens */}
        <div
          className="hamburgerMenu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") setMenuOpen(!menuOpen);
          }}
        >
          &#9776; {/* Unicode hamburger icon */}
        </div>
      </div>

      {/* Dropdown menu for small screens */}
      {menuOpen && (
        <div className="dropdownMenu">
          <p className="dropdownUsername">{username}</p>




  <Button
    variant="outlined"
    onClick={() => {
      localStorage.removeItem("token");
      navigate("/auth");
    }}
  >
    Logout
  </Button>
        </div>
      )}
    </div>


                <div style={{ display: "flex", justifyContent: "space-between", height: "90vh"}}>
                <div className="meetContainer">
                    <div className="leftPanel">
                            <h1 style={{fontSize: "38px", color: "#1976d2"}}>Meet, Chat and Collaborate</h1>
                            <p style={{fontSize: "18px", color: "rgba(0, 0, 0, 0.6)"}}> with People in multiple languages from anywhere.</p>

                            <div style={{ display: 'flex', gap: "15px", marginTop: "22px" }}>

                                <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Enter Meeting Code" variant="outlined" />
                                <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>

                            </div>
                    </div>
                    <div className='rightPanel'>
                        {/* <img srcSet='/images/homePage-Image.png' alt="" /> */}
                    <FeaturesSwiper/>
                    </div>


                </div>
            <History/> 
            </div>


        </>
    )

}

export default withAuth(Home)