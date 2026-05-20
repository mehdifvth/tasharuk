<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Tool;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── Categories ──────────────────────────────────────────────────────
        $categoryNames = ['Hand Tools', 'Power Tools', 'Garden', 'Cleaning', 'Construction', 'Recreational'];
        $categories = [];
        foreach ($categoryNames as $name) {
            $categories[$name] = Category::firstOrCreate(['name' => $name]);
        }

        // ─── Demo users ──────────────────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@tasharuk.com'],
            [
                'name'     => 'Administrateur',
                'password' => 'password123',
                'is_admin' => true,
            ]
        );

        $ahmed = User::firstOrCreate(
            ['email' => 'ahmed@tasharuk.com'],
            [
                'name'     => 'Ahmed Benali',
                'password' => 'password',
                'is_admin' => false,
            ]
        );

        $sara = User::firstOrCreate(
            ['email' => 'sara@tasharuk.com'],
            [
                'name'     => 'Sara El Idrissi',
                'password' => 'password',
                'is_admin' => false,
            ]
        );

        // ─── Demo tools ──────────────────────────────────────────────────────
        Tool::firstOrCreate(
            ['title' => 'Electric Drill Bosch', 'user_id' => $ahmed->id],
            [
                'category_id' => $categories['Power Tools']->id,
                'description' => 'Professional 18V cordless drill, with two batteries.',
                'condition'   => 'good',
                'price'       => 50,
            ]
        );

        Tool::firstOrCreate(
            ['title' => 'Lawn Mower', 'user_id' => $sara->id],
            [
                'category_id' => $categories['Garden']->id,
                'description' => 'Electric lawn mower, 1600W. Works perfectly.',
                'condition'   => 'new',
                'price'       => 80,
            ]
        );

        Tool::firstOrCreate(
            ['title' => 'Toolbox Set (40 pieces)', 'user_id' => $ahmed->id],
            [
                'category_id' => $categories['Hand Tools']->id,
                'description' => 'Complete set: wrenches, screwdrivers, pliers...',
                'condition'   => 'good',
                'price'       => 30,
            ]
        );
    }
}
