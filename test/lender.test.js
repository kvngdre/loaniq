const mongoose = require('mongoose')
const { app } = require("../index")
const Lender = require('../models/lenderModel')
const User = require('../models/userModel')
const supertest = require('supertest')
const sendOTPMail = require('../utils/sendOTPMail');
const generateOTP = require('../utils/generateOTP');
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const request = supertest(app);
let lenderId = ' ';
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyNTNlOTZiMTM3ZjUxNGZmN2NlOGMxNiIsImxlbmRlcklkIjoiNjI1MDFiYWI4ZTFkM2IyOGY1NGY3MTQ0IiwiZmlyc3ROYW1lIjoiSm9obiIsImxhc3ROYW1lIjoiS2VsbHkiLCJlbWFpbCI6InB1cmNoc29sdXRpb256QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImFjdGl2ZSI6dHJ1ZSwic2VnbWVudHMiOltdLCJpYXQiOjE2NDk2NjY0Nzl9.46aq0xAIQnoeuCaLAf5QFHJOXOfcFoWeXGwk--XJDHo';



// test('adds 1 + 2 to equal 3', () => {
//     expect(1+2).toBe(3);
//   });

  describe('/api/lender', () => {  
  
      beforeAll(async () => {
        const url='mongodb://localhost/test-apex';
        mongoose.createConnection(url); console.log('connected')
    //    await User.remove({});
        
       })

    afterAll(async () => {
  
    });

    describe('POST /Register Lender', () => {
      it('Should register Lender', async() => {
          const res = await request.post('/api/lenders/create-lender')
          .send({
            "companyName": "Apex Group",
            "companyAddress": "Ikeja City Mall, Lagos, Nigeria",
            "cacNumber": "123456",
            "category": "MFB",
            "phone": "09052639157",
            "email": "kennedyugo2@gmail.com",
            "lenderURL": "www.apex-group.com"
          })
          lenderId = res.body._id
          expect(res.statusCode).toEqual(201)
      })
    })
 
    describe('POST /Login Admin ', () => {
        it('Should register User', async() => {
            const res = await request.post('/api/users/login')
            .send({
                "email": "purchsolutionz@gmail.com",
                "password": "King!@12"
            })
            console.log('I am res', res)
            token = _body.
            expect(res.statusCode).toEqual(200)
        })
    })
})