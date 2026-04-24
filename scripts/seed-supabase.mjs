import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY) before running this script.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const bucketName = 'listing-photos';

const users = [
  {
    email: 'steve@gmail.com',
    password: 'pass123',
    name: 'Steve',
    location: 'Portland, OR',
    listings: [
      {
        title: 'Atomic Habits',
        description: 'Paperback copy in great condition. A practical guide to building better routines.',
        price: 18.99,
      },
      {
        title: 'Deep Work',
        description: 'Clean hardcover edition with minimal shelf wear. Excellent for focused study.',
        price: 16.5,
      },
      {
        title: 'Clean Code',
        description: 'Readable copy for developers who want a stronger craft foundation.',
        price: 27.49,
      },
      {
        title: 'The Pragmatic Programmer',
        description: 'Solid copy of the modern classic on software craftsmanship.',
        price: 29.0,
      },
      {
        title: 'Refactoring',
        description: 'Well-kept technical book for improving existing codebases.',
        price: 33.0,
      },
    ],
  },
  {
    email: 'maria@gmail.com',
    password: 'pass123',
    name: 'Maria',
    location: 'Austin, TX',
    listings: [
      {
        title: 'Sapiens',
        description: 'Great condition copy exploring the history of humankind.',
        price: 19.99,
      },
      {
        title: 'Thinking, Fast and Slow',
        description: 'Clean copy covering the psychology of decision-making.',
        price: 14.95,
      },
      {
        title: 'The Psychology of Money',
        description: 'Sharp, accessible book on how people think about wealth.',
        price: 17.99,
      },
      {
        title: 'The Lean Startup',
        description: 'Useful startup handbook in very good condition.',
        price: 15.0,
      },
      {
        title: 'Zero to One',
        description: 'Thoughtful startup and innovation book with a clean cover.',
        price: 13.75,
      },
    ],
  },
];

async function main() {
  for (const userSeed of users) {
    const user = await signInOrSignUp(userSeed.email, userSeed.password);
    await resetSeedData(user.id);
    await upsertProfile(user.id, userSeed.name, userSeed.email);

    for (const [listingIndex, listingSeed] of userSeed.listings.entries()) {
      const listing = await createListing(user.id, userSeed.location, listingSeed);
      const photos = await getBookCoverUrls(listingSeed.title, 3);
      await seedListingPhotos(listing.id, photos, listingSeed.title);
      console.log(`Seeded ${listingSeed.title} for ${userSeed.email} (${listingIndex + 1}/${userSeed.listings.length})`);
    }
  }

  console.log('Seed completed successfully.');
}

async function signInOrSignUp(email, password) {
  const signInResult = await supabase.auth.signInWithPassword({ email, password });

  if (signInResult.data.session?.user) {
    return signInResult.data.session.user;
  }

  const signInMessage = signInResult.error?.message ?? 'unknown sign-in error';
  console.log(`Sign-in failed for ${email}: ${signInMessage}. Trying sign-up...`);

  const signUpResult = await supabase.auth.signUp({ email, password });
  const session = signUpResult.data.session;

  if (!session?.user) {
    throw new Error(
      `Could not create a session for ${email}. Check your Supabase Auth settings and rerun this script.`
    );
  }

  return session.user;
}

async function resetSeedData(userId) {
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id')
    .eq('owner_id', userId);

  if (listingsError) {
    throw listingsError;
  }

  const listingIds = (listings ?? []).map((listing) => listing.id);

  if (listingIds.length > 0) {
    const { data: photos, error: photosError } = await supabase
      .from('listing_photos')
      .select('object_path')
      .in('listing_id', listingIds);

    if (photosError) {
      throw photosError;
    }

    const objectPaths = (photos ?? []).map((photo) => photo.object_path);
    if (objectPaths.length > 0) {
      const { error: removeError } = await supabase.storage.from(bucketName).remove(objectPaths);
      if (removeError) {
        throw removeError;
      }
    }

    const { error: deletePhotosError } = await supabase
      .from('listing_photos')
      .delete()
      .in('listing_id', listingIds);

    if (deletePhotosError) {
      throw deletePhotosError;
    }

    const { error: deleteListingsError } = await supabase
      .from('listings')
      .delete()
      .eq('owner_id', userId);

    if (deleteListingsError) {
      throw deleteListingsError;
    }
  }
}

async function upsertProfile(userId, name, email) {
  const { error } = await supabase.from('user_profiles').upsert(
    {
      id: userId,
      name,
      email,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'id',
    }
  );

  if (error) {
    throw error;
  }
}

async function createListing(ownerId, location, listingSeed) {
  const { data, error } = await supabase
    .from('listings')
    .insert({
      owner_id: ownerId,
      title: listingSeed.title,
      description: listingSeed.description,
      price: listingSeed.price,
      location,
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function getBookCoverUrls(title, photoCount) {
  const googleBooks = await fetchGoogleBooksCover(title);
  if (googleBooks.length > 0) {
    return googleBooks.slice(0, photoCount);
  }

  const openLibrary = await fetchOpenLibraryCovers(title);
  if (openLibrary.length > 0) {
    return openLibrary.slice(0, photoCount);
  }

  throw new Error(`No book cover image found for ${title}`);
}

async function fetchGoogleBooksCover(title) {
  try {
    const query = new URLSearchParams({
      q: `intitle:${title}`,
      maxResults: '5',
      printType: 'books',
      projection: 'lite',
    });

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${query.toString()}`);
    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const items = Array.isArray(payload.items) ? payload.items : [];
    const item = items.find((entry) => entry?.volumeInfo?.imageLinks?.thumbnail || entry?.volumeInfo?.imageLinks?.smallThumbnail) ?? items[0];

    if (!item?.id) {
      return [];
    }

    return [1, 2, 3].map(
      (zoom) => `https://books.google.com/books/content?id=${item.id}&printsec=frontcover&img=1&zoom=${zoom}&source=gbs_api`
    );
  } catch {
    return [];
  }
}

async function fetchOpenLibraryCovers(title) {
  try {
    const query = new URLSearchParams({
      title,
      limit: '5',
    });

    const response = await fetch(`https://openlibrary.org/search.json?${query.toString()}`);
    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const docs = Array.isArray(payload.docs) ? payload.docs : [];
    const doc = docs.find((entry) => entry.cover_i) ?? docs[0];

    if (!doc?.cover_i) {
      return [];
    }

    return ['S', 'M', 'L'].map(
      (size) => `https://covers.openlibrary.org/b/id/${doc.cover_i}-${size}.jpg`
    );
  } catch {
    return [];
  }
}

async function seedListingPhotos(listingId, imageUrls, title) {
  for (const [index, imageUrl] of imageUrls.entries()) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image for ${title}: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const filePath = `${listingId}/photo-${index + 1}.jpg`;

    const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, arrayBuffer, {
      contentType,
      upsert: false,
    });

    if (uploadError) {
      throw uploadError;
    }

    const { error: insertError } = await supabase.from('listing_photos').insert({
      listing_id: listingId,
      object_path: filePath,
      caption: `${title} photo ${index + 1}`,
      sort_order: index + 1,
    });

    if (insertError) {
      throw insertError;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
