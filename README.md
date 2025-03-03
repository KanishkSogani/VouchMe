# VouchMe

VouchMe is a blockchain-based testimonial system that enables users to provide testimonials securely and transparently, building a transparent and verifiable reputation system.

## Features

- 🔒 **Blockchain-based Testimonials** - Ensures immutable and verifiable endorsements.
- 📝 **User-friendly Interface** - Easily create, manage, and view testimonials.
- 🌐 **Decentralized Storage** - Testimonials are stored securely on-chain.
- 🔗 **Seamless Integration** - Connects easily with your wallet for authentication.

## How It Works

Follow these simple steps to start collecting and showcasing verified testimonials:

1️⃣ **Create Collection**

- Set up your personalized testimonial collection page with your address.
- Example link format: `vouch.me/[your-address]`

2️⃣ **Create Signed Testimonials**

- Testimonial givers can visit your link, create a signed testimonial, and share it with you directly via messaging apps like WhatsApp, Email, or Direct Link.

3️⃣ **Load & Showcase**

- Load the signed testimonial onto your account to display it.
- Each testimonial is **blockchain-verified** for authenticity.

## Local Setup

Follow these steps to set up VouchMe locally:

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/VouchMe.git
   cd VouchMe
   ```

2. **Install Dependencies**

   ```bash
   npm install 
   ```

3. **Setup Environment Variables**

   - Create a `.env` file in the root directory.
   - Get your `NEXT_PUBLIC_PROJECT_ID` from [Reown Cloud](https://cloud.reown.com/).
   - Add it to the `.env` file:
     ```env
     NEXT_PUBLIC_PROJECT_ID=your_project_id_here
     ```

4. **Run the Development Server**

   ```bash
   npm run dev 
   ```

   The app will be available at `http://localhost:3000/`.

