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

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Categories ──────────────────────────────────────────
        $categoryNames = [
            'Outillage Électroportatif', 'Outils à main', 'Jardinage',
            'Construction & Gros œuvre', 'Nettoyage & Entretien',
            'Loisirs & Camping', 'Électricité & Éclairage', 'Peinture & Décoration'
        ];
        
        $categories = [];
        foreach ($categoryNames as $name) {
            $categories[$name] = Category::firstOrCreate(['name' => $name]);
        }

        // ─── Admin ──────────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@tasharuk.com'],
            [
                'name'     => 'Administrateur Système',
                'password' => Hash::make('password123'),
                'is_admin' => true,
                'role'     => 'borrower',
            ]
        );

        // ─── Users ──────────────────────────────────────────────────────
        $userData = [
            ['name' => 'Ahmed Benali', 'email' => 'ahmed@example.com', 'role' => 'owner'],
            ['name' => 'Sara El Idrissi', 'email' => 'sara@example.com', 'role' => 'owner'],
            ['name' => 'Youssef Mansouri', 'email' => 'youssef@example.com', 'role' => 'borrower'],
            ['name' => 'Khadija Amrani', 'email' => 'khadija@example.com', 'role' => 'owner'],
            ['name' => 'Mehdi Tazi', 'email' => 'mehdi@example.com', 'role' => 'borrower'],
            ['name' => 'Laila Hakimi', 'email' => 'laila@example.com', 'role' => 'borrower'],
            ['name' => 'Omar Zairi', 'email' => 'omar@example.com', 'role' => 'owner'],
        ];

        $users = [];
        foreach ($userData as $u) {
            $users[] = User::firstOrCreate(['email' => $u['email']], [
                'name' => $u['name'],
                'password' => Hash::make('password'),
                'role' => $u['role'],
                'is_admin' => false
            ]);
        }

        // ─── Tools ──────────────────
        $toolsData = [
            ['email' => 'ahmed@example.com', 'cat' => 'Outillage Électroportatif', 'title' => 'Perceuse Bosch Professional', 'price' => 5],
            ['email' => 'ahmed@example.com', 'cat' => 'Nettoyage & Entretien', 'title' => 'Kärcher K5 Haute Pression', 'price' => 8],
            ['email' => 'sara@example.com', 'cat' => 'Jardinage', 'title' => 'Tondeuse Makita électrique', 'price' => 7],
            ['email' => 'sara@example.com', 'cat' => 'Outils à main', 'title' => 'Coffret Douilles Magnusson', 'price' => 3],
            ['email' => 'khadija@example.com', 'cat' => 'Construction & Gros œuvre', 'title' => 'Bétonnière 160L', 'price' => 12],
            ['email' => 'omar@example.com', 'cat' => 'Loisirs & Camping', 'title' => 'Tente Quechua 3p', 'price' => 4],
            ['email' => 'omar@example.com', 'cat' => 'Outillage Électroportatif', 'title' => 'Scie circulaire DeWalt', 'price' => 6],
        ];

        $tools = [];
        foreach ($toolsData as $t) {
            $owner = User::where('email', $t['email'])->first();
            $tools[] = Tool::updateOrCreate(
                ['title' => $t['title'], 'user_id' => $owner->id],
                [
                    'category_id' => $categories[$t['cat']]->id,
                    'description' => 'Outil de test pour la plateforme.',
                    'condition' => 'good',
                    'price' => $t['price'],
                ]
            );
        }

        // ─── Bookings & Reviews (At least 25) ───────────────────────────────────
        $borrowers = User::where('role', 'borrower')->get();
        $comments = [
            'Super outil, très bien entretenu !',
            'Propriétaire très sympa et ponctuel.',
            'Parfait pour mes travaux de weekend.',
            'Un peu poussiéreux mais fonctionne bien.',
            'Emprunteur très soigneux, je recommande.',
            'Transaction fluide, merci !',
            'Outil puissant, a fait le job.',
            'Je relouerai sans hésiter.',
            'Excellent service, merci pour le partage.',
            'Matériel de pro, un plaisir à utiliser.'
        ];

        for ($i = 0; $i < 30; $i++) {
            $tool = $tools[array_rand($tools)];
            $borrower = $borrowers->random();
            if ($tool->user_id === $borrower->id) continue;

            $status = $i < 25 ? 'completed' : 'pending';
            $startDate = Carbon::now()->subDays(rand(5, 30))->subHours(rand(1, 24));
            $endDate = (clone $startDate)->addHours(rand(2, 48));

            $booking = Booking::create([
                'tool_id' => $tool->id,
                'borrower_id' => $borrower->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => $status,
                'picked_up_at' => $status === 'completed' ? $startDate : null,
                'returned_at' => $status === 'completed' ? $endDate : null,
                'final_price' => rand(10, 100),
            ]);

            if ($status === 'completed') {
                // Review from Borrower to Owner
                Review::create([
                    'booking_id' => $booking->id,
                    'reviewer_id' => $borrower->id,
                    'reviewee_id' => $tool->user_id,
                    'rating' => rand(4, 5),
                    'comment' => $comments[array_rand($comments)],
                ]);

                // Review from Owner to Borrower (Randomly, not always)
                if (rand(0, 1)) {
                    Review::create([
                        'booking_id' => $booking->id,
                        'reviewer_id' => $tool->user_id,
                        'reviewee_id' => $borrower->id,
                        'rating' => rand(4, 5),
                        'comment' => 'Emprunteur sérieux et ponctuel.',
                    ]);
                }
            }
        }
    }
}
