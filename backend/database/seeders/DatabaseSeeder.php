<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Tool;
use App\Models\Booking;
use App\Models\Review;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Désactiver les contraintes de clés étrangères pour le nettoyage
        Schema::disableForeignKeyConstraints();
        DB::table('reviews')->truncate();
        DB::table('notifications')->truncate();
        DB::table('messages')->truncate();
        DB::table('bookings')->truncate();
        DB::table('tools')->truncate();
        DB::table('categories')->truncate();
        DB::table('users')->truncate();
        Schema::enableForeignKeyConstraints();

        // ─── 1. Categories ──────────────────────────────────────────
        $categoryNames = [
            'Outillage Électroportatif', 
            'Outils à main', 
            'Jardinage',
            'Construction & Gros œuvre', 
            'Nettoyage & Entretien',
            'Loisirs & Camping', 
            'Électricité & Éclairage', 
            'Peinture & Décoration'
        ];
        
        $categories = [];
        foreach ($categoryNames as $name) {
            $categories[$name] = Category::create(['name' => $name]);
        }

        // ─── 2. Admins ──────────────────────────────────────────────────────
        User::create([
            'name'     => 'Super Admin',
            'email'    => 'admin@tasharuk.com',
            'password' => Hash::make('password123'),
            'is_admin' => true,
            'role'     => 'owner',
        ]);

        User::create([
            'name'     => 'Manager Tasharuk',
            'email'    => 'manager@tasharuk.com',
            'password' => Hash::make('password123'),
            'is_admin' => true,
            'role'     => 'borrower',
        ]);

        // ─── 3. Regular Users ──────────────────────────────────────────────
        $userData = [
            ['name' => 'Ahmed Benali', 'email' => 'ahmed@tasharuk.com', 'role' => 'owner'],
            ['name' => 'Sara El Idrissi', 'email' => 'sara@tasharuk.com', 'role' => 'owner'],
            ['name' => 'Youssef Mansouri', 'email' => 'youssef@tasharuk.com', 'role' => 'borrower'],
            ['name' => 'Khadija Amrani', 'email' => 'khadija@tasharuk.com', 'role' => 'owner'],
            ['name' => 'Mehdi Tazi', 'email' => 'mehdi@tasharuk.com', 'role' => 'borrower'],
            ['name' => 'Laila Hakimi', 'email' => 'laila@tasharuk.com', 'role' => 'borrower'],
            ['name' => 'Omar Zairi', 'email' => 'omar@tasharuk.com', 'role' => 'owner'],
            ['name' => 'Zineb Bennani', 'email' => 'zineb@tasharuk.com', 'role' => 'owner'],
            ['name' => 'Driss Alami', 'email' => 'driss@tasharuk.com', 'role' => 'borrower'],
            ['name' => 'Fatima Zahra', 'email' => 'fatima@tasharuk.com', 'role' => 'borrower'],
        ];

        $users = [];
        foreach ($userData as $u) {
            $users[] = User::create([
                'name' => $u['name'],
                'email' => $u['email'],
                'password' => Hash::make('password'),
                'role' => $u['role'],
                'is_admin' => false
            ]);
        }

        // ─── 4. Tools (25 items) ──────────────────
        $cities = [
            'Casablanca' => ['lat' => 33.5731, 'lng' => -7.5898],
            'Rabat'      => ['lat' => 34.0209, 'lng' => -6.8416],
            'Marrakech'  => ['lat' => 31.6295, 'lng' => -7.9811],
            'Tanger'     => ['lat' => 35.7595, 'lng' => -5.8340],
            'Agadir'     => ['lat' => 30.4278, 'lng' => -9.5981],
            'Fès'        => ['lat' => 34.0181, 'lng' => -5.0078],
        ];

        $toolsInfo = [
            ['cat' => 'Outillage Électroportatif', 'title' => 'Perceuse à percussion Bosch', 'price' => 5, 'img' => 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=500'],
            ['cat' => 'Outillage Électroportatif', 'title' => 'Scie sauteuse Makita', 'price' => 6, 'img' => 'https://images.unsplash.com/photo-1540103359327-046626647970?q=80&w=500'],
            ['cat' => 'Jardinage', 'title' => 'Tondeuse à gazon électrique', 'price' => 10, 'img' => 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=500'],
            ['cat' => 'Nettoyage & Entretien', 'title' => 'Nettoyeur haute pression Kärcher', 'price' => 12, 'img' => 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=500'],
            ['cat' => 'Construction & Gros œuvre', 'title' => 'Bétonnière 120L', 'price' => 20, 'img' => 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=500'],
            ['cat' => 'Outils à main', 'title' => 'Coffret de douilles Magnusson', 'price' => 4, 'img' => 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=500'],
            ['cat' => 'Loisirs & Camping', 'title' => 'Tente 4 personnes Quechua', 'price' => 8, 'img' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=500'],
            ['cat' => 'Électricité & Éclairage', 'title' => 'Groupe électrogène 2200W', 'price' => 15, 'img' => 'https://images.unsplash.com/photo-1590215757755-e7a83d726b21?q=80&w=500'],
            ['cat' => 'Jardinage', 'title' => 'Taille-haie thermique Stihl', 'price' => 9, 'img' => 'https://images.unsplash.com/photo-1598901865236-d6935272a95c?q=80&w=500'],
            ['cat' => 'Outillage Électroportatif', 'title' => 'Meuleuse d\'angle DeWalt', 'price' => 7, 'img' => 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=500'],
            ['cat' => 'Nettoyage & Entretien', 'title' => 'Aspirateur industriel eau et poussière', 'price' => 8, 'img' => 'https://images.unsplash.com/photo-1621419401720-639a0665e3be?q=80&w=500'],
            ['cat' => 'Peinture & Décoration', 'title' => 'Pistolet à peinture professionnel', 'price' => 6, 'img' => 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=500'],
            ['cat' => 'Outils à main', 'title' => 'Échelle télescopique 3.8m', 'price' => 5, 'img' => 'https://images.unsplash.com/photo-1616422285623-13ff0167c958?q=80&w=500'],
            ['cat' => 'Construction & Gros œuvre', 'title' => 'Marteau-piqueur perforateur', 'price' => 14, 'img' => 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=500'],
            ['cat' => 'Jardinage', 'title' => 'Tronçonneuse à chaîne Stihl', 'price' => 11, 'img' => 'https://images.unsplash.com/photo-1610476839063-8c467a8efb7a?q=80&w=500'],
            ['cat' => 'Outillage Électroportatif', 'title' => 'Ponceuse excentrique orbitale', 'price' => 5, 'img' => 'https://images.unsplash.com/photo-1586864387789-628af9face39?q=80&w=500'],
            ['cat' => 'Loisirs & Camping', 'title' => 'Glacière électrique 30L', 'price' => 5, 'img' => 'https://images.unsplash.com/photo-1594498257600-ebb8a5203b8a?q=80&w=500'],
            ['cat' => 'Électricité & Éclairage', 'title' => 'Projecteur LED sur trépied', 'price' => 4, 'img' => 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=500'],
            ['cat' => 'Jardinage', 'title' => 'Souffleur de feuilles thermique', 'price' => 7, 'img' => 'https://images.unsplash.com/photo-1622325327228-364234033f91?q=80&w=500'],
            ['cat' => 'Outillage Électroportatif', 'title' => 'Rabot électrique 82mm', 'price' => 6, 'img' => 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=500'],
            ['cat' => 'Outils à main', 'title' => 'Niveau laser rotatif 360', 'price' => 10, 'img' => 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=500'],
            ['cat' => 'Peinture & Décoration', 'title' => 'Décolleuse à papier peint vapeur', 'price' => 5, 'img' => 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=500'],
            ['cat' => 'Nettoyage & Entretien', 'title' => 'Shampouineuse moquette/sièges', 'price' => 15, 'img' => 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=500'],
            ['cat' => 'Jardinage', 'title' => 'Motoculteur thermique', 'price' => 25, 'img' => 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=500'],
            ['cat' => 'Outillage Électroportatif', 'title' => 'Poste à souder Inverter', 'price' => 10, 'img' => 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=500'],
        ];

        $owners = User::where('role', 'owner')->get();
        $tools = [];
        
        foreach ($toolsInfo as $index => $t) {
            $owner = $owners->random();
            $cityNamesList = array_keys($cities);
            $cityName = $cityNamesList[$index % count($cityNamesList)];
            $cityInfo = $cities[$cityName];

            $tools[] = Tool::create([
                'user_id' => $owner->id,
                'category_id' => $categories[$t['cat']]->id,
                'title' => $t['title'],
                'description' => "Cet outil est indispensable pour vos projets de " . strtolower($t['cat']) . ". Il est en excellent état et régulièrement entretenu.",
                'condition' => 'good',
                'price' => $t['price'],
                'image' => $t['img'],
                'city' => $cityName,
                'latitude' => $cityInfo['lat'],
                'longitude' => $cityInfo['lng'],
            ]);
        }

        // ─── 5. Bookings & Reviews ──────────────────────────────────────────────
        $borrowers = User::where('role', 'borrower')->get();
        $statuses = ['completed', 'completed', 'completed', 'approved', 'pending', 'cancelled'];
        
        $borrowerReviews = [
            'Outil parfait, exactement ce dont j\'avais besoin.',
            'Propriétaire très flexible pour la remise des clés.',
            'L\'outil fonctionne à merveille, très bien entretenu.',
            'Service impeccable, je recommande vivement.',
            'Très bonne expérience, merci encore !',
        ];

        $ownerReviews = [
            'Emprunteur ponctuel et très soigneux avec le matériel.',
            'Tout s\'est bien passé, communication fluide.',
            'Je recommande cet emprunteur sans hésitation.',
            'Matériel rendu propre et dans les temps.',
            'Personne très sérieuse, au plaisir !',
        ];

        for ($i = 0; $i < 60; $i++) {
            $tool = $tools[array_rand($tools)];
            $borrower = $borrowers->random();
            
            if ($tool->user_id === $borrower->id) continue;

            $status = $statuses[array_rand($statuses)];
            $startDate = Carbon::now()->subDays(rand(1, 45));
            $endDate = (clone $startDate)->addHours(rand(2, 72));

            $booking = Booking::create([
                'tool_id' => $tool->id,
                'borrower_id' => $borrower->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
                'total_price' => round(($startDate->diffInMinutes($endDate) / 60) * $tool->price, 2),
                'confirmation_code' => 'TAS-' . strtoupper(substr(md5(uniqid()), 0, 4)),
                'return_code' => 'RET-' . strtoupper(substr(md5(uniqid()), 0, 4)),
                'picked_up_at' => in_array($status, ['completed', 'approved']) ? $startDate : null,
                'returned_at' => $status === 'completed' ? $endDate : null,
                'final_price' => $status === 'completed' ? round(($startDate->diffInMinutes($endDate) / 60) * $tool->price, 2) : null,
            ]);

            if ($status === 'completed') {
                // Borrower rates Owner
                Review::create([
                    'booking_id' => $booking->id,
                    'reviewer_id' => $borrower->id,
                    'reviewee_id' => $tool->user_id,
                    'rating' => rand(4, 5),
                    'comment' => $borrowerReviews[array_rand($borrowerReviews)],
                ]);

                // Owner rates Borrower (80% chance)
                if (rand(1, 10) <= 8) {
                    Review::create([
                        'booking_id' => $booking->id,
                        'reviewer_id' => $tool->user_id,
                        'reviewee_id' => $borrower->id,
                        'rating' => rand(4, 5),
                        'comment' => $ownerReviews[array_rand($ownerReviews)],
                    ]);
                }
            }
        }
    }
}
