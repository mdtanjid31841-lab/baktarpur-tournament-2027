# বক্তারপুর ডেমিনিবার ফুটবল টুর্নামেন্ট ২০২৭ — ওয়েবসাইট

মোবাইল-ফ্রেন্ডলি Next.js সাইট, দল নিবন্ধন ফরম, ম্যানুয়াল পেমেন্ট যাচাই এবং Supabase-ভিত্তিক অ্যাডমিন প্যানেল। কোনো বিজ্ঞাপন SDK নেই।

## আগে জেনে নিন
- নিবন্ধন ফি: ৳১,৫০০ / দল
- সর্বোচ্চ দল: ১৬
- আপাতত নগদ নম্বর: `01616388789`
- বিকাশ নম্বর: কোডে এখনো যোগ করা হয়নি
- আবেদন জমা মানেই নিবন্ধন নিশ্চিত নয়; অ্যাডমিনকে লেনদেন যাচাই করে অনুমোদন দিতে হবে।
- Supabase, Node.js এবং ডেপ্লয়মেন্ট অ্যাকাউন্ট তৈরি/কনফিগার করা এই starter code-এর বাইরে আলাদা সেটআপের কাজ।

## ১) যা লাগবে
1. Node.js 20 বা তার পরের LTS সংস্করণ
2. Supabase অ্যাকাউন্ট: https://supabase.com
3. পরে প্রকাশ করতে Vercel অ্যাকাউন্ট: https://vercel.com
4. টার্মিনাল/কমান্ড চালানোর ব্যবস্থা

## ২) Supabase ডেটাবেস
1. Supabase-এ নতুন project তৈরি করুন।
2. Project > SQL Editor খুলুন।
3. এই ফোল্ডারের `supabase/schema.sql` ফাইলের সম্পূর্ণ SQL কপি করে রান করুন।
4. Authentication > Providers-এ Email provider চালু রাখুন। অ্যাডমিনের জন্য একটি শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।
5. Authentication > Users থেকে নিজের অ্যাডমিন ইমেইল দিয়ে user তৈরি করুন। ইমেইল নিশ্চিতকরণ চালু থাকলে আগে সেটি সম্পন্ন করুন।
6. ওই user-এর UUID কপি করুন।
7. SQL Editor-এ নিচের query-তে `PASTE-ADMIN-USER-UUID-HERE` বদলে নিজের UUID দিয়ে রান করুন:

```sql
insert into public.admin_users (user_id)
values ('PASTE-ADMIN-USER-UUID-HERE');
```

এই ধাপটি জরুরি: UUID `admin_users`-এ না থাকলে লগইন হলেও নিবন্ধনের তালিকা পড়া বা আপডেট করা যাবে না। `admin_users`-এ শুধু বিশ্বস্ত অ্যাডমিনের UUID যোগ করুন।

## ৩) স্থানীয়ভাবে চালানো
প্রকল্প ফোল্ডারে টার্মিনাল খুলুন:

```bash
npm install
```

`.env.example` কপি করে `.env.local` নামে ফাইল তৈরি করুন এবং Supabase Dashboard > Project Settings > API থেকে URL ও **anon/public key** বসান:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

**service_role key কখনোই `.env.local`-এর `NEXT_PUBLIC_` ভ্যারিয়েবলে বা ব্রাউজারে রাখবেন না।** এই starter-এ সেটি প্রয়োজন নেই।

তারপর চালান:

```bash
npm run dev
```

ব্রাউজারে `http://localhost:3000` খুলুন। নিবন্ধন: `/register`, অ্যাডমিন: `/admin`।

## ৪) অনলাইনে প্রকাশ
1. কোডটি নিজের GitHub repository-তে push করুন।
2. Vercel-এ repository import করুন।
3. Vercel Project Settings > Environment Variables-এ `NEXT_PUBLIC_SUPABASE_URL` ও `NEXT_PUBLIC_SUPABASE_ANON_KEY` যোগ করুন।
4. Deploy করুন। Vercel-এর দেওয়া URL দিয়ে সাইট চালু হবে।
5. নিজস্ব domain পরে কিনে Vercel-এর Domain নির্দেশনা অনুসারে সংযুক্ত করা যাবে।

## ৫) টুর্নামেন্ট চালুর আগে অবশ্যই পরীক্ষা করুন
- নিজের পরীক্ষামূলক আবেদন জমা দিন।
- লগআউট অবস্থায় `/admin` থেকে কোনো নিবন্ধনের তথ্য পড়া যায় না নিশ্চিত করুন।
- অ্যাডমিন হিসেবে লগইন করে আবেদন দেখা ও স্ট্যাটাস বদলানো যায় নিশ্চিত করুন।
- ট্রানজেকশন আইডি সত্যিই পেমেন্টের সঙ্গে মেলে কিনা ম্যানুয়ালি যাচাই করুন।
- ১৬টি দলের সীমা এই starter-এ **স্বয়ংক্রিয়ভাবে কঠোরভাবে enforce করা হয়নি**; পাবলিক ফরম বন্ধ করতে বা ১৬টি অনুমোদিত দলের সীমা নিশ্চিত করতে launch-এর আগে database transaction/trigger ও admin workflow যোগ করা উচিত।
- ফরমের `players` অংশটি সাধারণ নামের তালিকা; প্রয়োজন হলে খেলোয়াড়ের আলাদা কাঠামোবদ্ধ ফিল্ড তৈরি করুন।
- privacy notice, refund/cancellation policy, tournament rules, contact number, tournament dates, logo ও bKash number যোগ করুন।
- ফোন নম্বর/ব্যক্তিগত তথ্য শুধু প্রয়োজনীয় কাজের জন্য রাখুন; অ্যাডমিন পাসওয়ার্ড শেয়ার করবেন না।

## ৬) লোগো ও ডিজাইন
আপনার দেওয়া আসল টুর্নামেন্ট লোগো `public/bft-logo.jpg` হিসেবে যুক্ত করা হয়েছে এবং হোমপেজ, নিবন্ধন ও অ্যাডমিন হেডারে দেখানো হবে।

## সীমাবদ্ধতা
এটি একটি starter project, ইতিমধ্যে প্রকাশিত লাইভ সাইট নয়। কোনো টাকা স্বয়ংক্রিয়ভাবে কাটা বা পেমেন্ট provider-এর সঙ্গে যাচাই করা হয় না। ম্যানুয়াল ট্রানজেকশন ID যাচাইয়ের জন্য admin panel রয়েছে। বাস্তবে প্রকাশের আগে একজন বিশ্বস্ত ডেভেলপার দিয়ে security review ও end-to-end testing করান।
