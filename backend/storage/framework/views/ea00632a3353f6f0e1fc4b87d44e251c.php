

<?php $__env->startSection('content'); ?>
<div class="mb-4">
    <h2>Dernières Réservations</h2>
</div>

<div class="card">
    <div class="card-body">
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Outil</th>
                    <th>Emprunteur</th>
                    <th>Dates</th>
                    <th>Prix Total</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                <?php $__currentLoopData = $bookings; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $booking): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <tr>
                    <td><?php echo e($booking->tool->title); ?></td>
                    <td><?php echo e($booking->borrower->name); ?></td>
                    <td>Du <?php echo e($booking->start_date); ?> au <?php echo e($booking->end_date); ?></td>
                    <td><?php echo e($booking->total_price); ?> DH</td>
                    <td>
                        <?php if($booking->status == 'approved'): ?>
                            <span class="badge bg-success">Approuvé</span>
                        <?php elseif($booking->status == 'pending'): ?>
                            <span class="badge bg-warning text-dark">En attente</span>
                        <?php else: ?>
                            <span class="badge bg-danger"><?php echo e($booking->status); ?></span>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </tbody>
        </table>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\user\Documents\laravel\tasharuk-full\backend\resources\views/admin/bookings.blade.php ENDPATH**/ ?>