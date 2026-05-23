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
        // ─── Categories (Français) ──────────────────────────────────────────
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
            $categories[$name] = Category::firstOrCreate(['name' => $name]);
        }

        // ─── Demo users ──────────────────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@tasharuk.com'],
            [
                'name'     => 'Administrateur Système',
                'password' => Hash::make('password123'),
                'is_admin' => true,
                'role'     => 'borrower',
            ]
        );

        $users = [
            [
                'name' => 'Ahmed Benali',
                'email' => 'ahmed@example.com',
                'password' => Hash::make('password'),
                'role' => 'owner',
            ],
            [
                'name' => 'Sara El Idrissi',
                'email' => 'sara@example.com',
                'password' => Hash::make('password'),
                'role' => 'owner',
            ],
            [
                'name' => 'Youssef Mansouri',
                'email' => 'youssef@example.com',
                'password' => Hash::make('password'),
                'role' => 'borrower',
            ],
            [
                'name' => 'Khadija Amrani',
                'email' => 'khadija@example.com',
                'password' => Hash::make('password'),
                'role' => 'owner',
            ],
            [
                'name' => 'Mehdi Tazi',
                'email' => 'mehdi@example.com',
                'password' => Hash::make('password'),
                'role' => 'borrower',
            ],
        ];

        $createdUsers = [];
        foreach ($users as $u) {
            $createdUsers[] = User::firstOrCreate(['email' => $u['email']], $u);
        }

        // ─── Demo tools ──────────────────────────────────────────────────────
        $toolsData = [
            [
                'user_email' => 'ahmed@example.com',
                'category' => 'Outillage Électroportatif',
                'title' => 'Perceuse à percussion Bosch Professional',
                'description' => 'Perceuse puissante 18V avec 2 batteries et chargeur rapide. Idéal pour le béton et le métal.',
                'condition' => 'new',
                'price' => 60,
                'image' => 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'ahmed@example.com',
                'category' => 'Nettoyage & Entretien',
                'title' => 'Nettoyeur Haute Pression Kärcher K5',
                'description' => 'Parfait pour nettoyer votre terrasse, voiture ou façade. Pression réglable.',
                'condition' => 'good',
                'price' => 120,
                'image' => 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'sara@example.com',
                'category' => 'Jardinage',
                'title' => 'Tondeuse à gazon électrique Makita',
                'description' => 'Tondeuse silencieuse et efficace pour jardins jusqu\'à 500m2. Bac de ramassage inclus.',
                'condition' => 'good',
                'price' => 90,
                'image' => 'https://images.unsplash.com/photo-1592819695396-0661b3694663?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'sara@example.com',
                'category' => 'Outils à main',
                'title' => 'Coffret de douilles Magnusson 94 pièces',
                'description' => 'Coffret complet de haute qualité. Cliquets, douilles, embouts de vissage.',
                'condition' => 'new',
                'price' => 40,
                'image' => 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'khadija@example.com',
                'category' => 'Construction & Gros œuvre',
                'title' => 'Bétonnière électrique 160L',
                'description' => 'Bétonnière robuste pour vos travaux de maçonnerie. Facile à déplacer.',
                'condition' => 'good',
                'price' => 150,
                'image' => 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'khadija@example.com',
                'category' => 'Électricité & Éclairage',
                'title' => 'Projecteur de chantier LED 50W',
                'description' => 'Éclairage puissant pour travailler tard le soir ou dans des zones sombres.',
                'condition' => 'new',
                'price' => 25,
                'image' => 'https://images.unsplash.com/photo-1513506494209-4089c16fc85a?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'ahmed@example.com',
                'category' => 'Loisirs & Camping',
                'title' => 'Tente Quechua 2 Seconds (3 places)',
                'description' => 'Tente iconique, montage ultra rapide. Idéal pour un weekend improvisé.',
                'condition' => 'good',
                'price' => 35,
                'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'sara@example.com',
                'category' => 'Outillage Électroportatif',
                'title' => 'Scie circulaire sans fil DeWalt',
                'description' => 'Lame de 184mm, coupe précise et puissante. Idéale pour les découpes de bois sur chantier.',
                'condition' => 'new',
                'price' => 75,
                'image' => 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'khadija@example.com',
                'category' => 'Jardinage',
                'title' => 'Tronçonneuse thermique Stihl',
                'description' => 'Modèle puissant pour l\'abattage et l\'élagage. Entretien régulier effectué.',
                'condition' => 'good',
                'price' => 110,
                'image' => 'https://images.unsplash.com/photo-1622313337905-2d334e9e0331?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'ahmed@example.com',
                'category' => 'Construction & Gros œuvre',
                'title' => 'Escabeau professionnel 7 marches',
                'description' => 'Escabeau en aluminium léger et robuste. Pieds antidérapants.',
                'condition' => 'good',
                'price' => 20,
                'image' => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'sara@example.com',
                'category' => 'Nettoyage & Entretien',
                'title' => 'Aspirateur de chantier eau et poussière',
                'description' => 'Cuve inox 30L, idéal pour le garage ou après travaux. Fonction souffleur.',
                'condition' => 'good',
                'price' => 45,
                'image' => 'https://images.unsplash.com/photo-1610427672288-751249622d9c?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'khadija@example.com',
                'category' => 'Construction & Gros œuvre',
                'title' => 'Télémètre laser Bosch 50m',
                'description' => 'Mesure rapide et précise de distances, surfaces et volumes. Bluetooth inclus.',
                'condition' => 'new',
                'price' => 15,
                'image' => 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'ahmed@example.com',
                'category' => 'Outillage Électroportatif',
                'title' => 'Ponceuse vibrante orbitale Makita',
                'description' => 'Ponçage fin et sans traces. Système d\'aspiration des poussières.',
                'condition' => 'good',
                'price' => 40,
                'image' => 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'sara@example.com',
                'category' => 'Jardinage',
                'title' => 'Coupe-bordure électrique Black+Decker',
                'description' => 'Léger et maniable pour des finitions de jardin impeccables.',
                'condition' => 'new',
                'price' => 30,
                'image' => 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'khadija@example.com',
                'category' => 'Outils à main',
                'title' => 'Lot de 50 tournevis de précision',
                'description' => 'Idéal pour électronique, horlogerie ou petits montages.',
                'condition' => 'new',
                'price' => 10,
                'image' => 'https://images.unsplash.com/photo-1530124566582-aa6127763644?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'ahmed@example.com',
                'category' => 'Construction & Gros œuvre',
                'title' => 'Niveau laser rotatif 360°',
                'description' => 'Projection de lignes horizontales et verticales. Auto-nivelant. Avec trépied.',
                'condition' => 'new',
                'price' => 85,
                'image' => 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'sara@example.com',
                'category' => 'Outillage Électroportatif',
                'title' => 'Meuleuse d\'angle Ryobi 125mm',
                'description' => 'Polyvalente pour meuler, brosser et polir. Poignée réglable.',
                'condition' => 'good',
                'price' => 50,
                'image' => 'https://images.unsplash.com/photo-1574635843846-993d987d605f?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'khadija@example.com',
                'category' => 'Construction & Gros œuvre',
                'title' => 'Diable de transport charge lourde 200kg',
                'description' => 'Pratique pour déplacer des cartons, meubles ou électroménager.',
                'condition' => 'good',
                'price' => 25,
                'image' => 'https://images.unsplash.com/photo-1621905252507-b35432d94b4c?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'ahmed@example.com',
                'category' => 'Construction & Gros œuvre',
                'title' => 'Échelle télescopique 3.8m',
                'description' => 'Peu encombrante une fois repliée. Se transporte dans un coffre de voiture.',
                'condition' => 'new',
                'price' => 30,
                'image' => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'sara@example.com',
                'category' => 'Jardinage',
                'title' => 'Scarificateur à gazon électrique',
                'description' => 'Élimine la mousse et aère votre pelouse pour une meilleure repousse.',
                'condition' => 'good',
                'price' => 65,
                'image' => 'https://images.unsplash.com/photo-1592819695396-0661b3694663?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'khadija@example.com',
                'category' => 'Peinture & Décoration',
                'title' => 'Pistolet à peinture basse pression',
                'description' => 'Peinture rapide et uniforme. Idéal pour murs, plafonds et clôtures.',
                'condition' => 'new',
                'price' => 55,
                'image' => 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'user_email' => 'ahmed@example.com',
                'category' => 'Électricité & Éclairage',
                'title' => 'Générateur électrique 2800W',
                'description' => 'Source d\'énergie autonome pour chantiers isolés ou camping sauvage.',
                'condition' => 'good',
                'price' => 180,
                'image' => 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
            ],
        ];

        $createdTools = [];
        foreach ($toolsData as $t) {
            $user = User::where('email', $t['user_email'])->first();
            $createdTools[] = Tool::firstOrCreate(
                ['title' => $t['title'], 'user_id' => $user->id],
                [
                    'category_id' => $categories[$t['category']]->id,
                    'description' => $t['description'],
                    'condition' => $t['condition'],
                    'price' => $t['price'],
                    'image' => $t['image'],
                ]
            );
        }

        // ─── Demo bookings ───────────────────────────────────────────────────
        $youssef = User::where('email', 'youssef@example.com')->first();
        $mehdi = User::where('email', 'mehdi@example.com')->first();

        // 1. Booking terminée avec avis
        $b1 = Booking::create([
            'tool_id' => $createdTools[0]->id, // Perceuse Ahmed
            'borrower_id' => $youssef->id,
            'start_date' => Carbon::now()->subDays(10),
            'end_date' => Carbon::now()->subDays(8),
            'status' => 'completed',
            'picked_up_at' => Carbon::now()->subDays(10)->addHours(2),
            'returned_at' => Carbon::now()->subDays(8)->addHours(1),
            'final_price' => 120, // 2 jours * 60
        ]);

        Review::create([
            'booking_id' => $b1->id,
            'reviewer_id' => $youssef->id,
            'rating' => 5,
            'comment' => 'La perceuse est excellente, Ahmed est très sympathique et arrangeant.',
        ]);

        // 2. Booking en cours
        Booking::create([
            'tool_id' => $createdTools[2]->id, // Tondeuse Sara
            'borrower_id' => $mehdi->id,
            'start_date' => Carbon::now()->subDays(1),
            'end_date' => Carbon::now()->addDays(1),
            'status' => 'approved',
            'picked_up_at' => Carbon::now()->subDays(1)->addHours(1),
            'confirmation_code' => 'TAS-1234',
            'return_code' => 'RET-5678',
        ]);

        // 3. Booking en attente
        Booking::create([
            'tool_id' => $createdTools[1]->id, // Kärcher Ahmed
            'borrower_id' => $youssef->id,
            'start_date' => Carbon::now()->addDays(5),
            'end_date' => Carbon::now()->addDays(6),
            'status' => 'pending',
        ]);
    }
}
