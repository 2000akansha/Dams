# Dams Project Backend

**Overview**: Backend for managing compensation for beneficiaries of land acquisitions for dam construction in Himachal Pradesh.

**Technologies**: Node.js, Express.js, MongoDB, Mongoose, JWT

**Installation**:
1. Clone the repo:
   ```bash
   git clone https://github.com/2000akansha/Dams_Project_Innobles.git
   cd Dams_Project_Innobles/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

**Configuration**: Create a `.env` file with:
```
PORT=3000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
```

**API Endpoints**:
- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Beneficiaries**: `/api/beneficiaries`
- **Compensation**: `/api/compensation`

**Run**:
```bash
npm start
```


---

