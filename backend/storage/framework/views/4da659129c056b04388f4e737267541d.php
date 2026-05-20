

<?php $__env->startSection('content'); ?>
<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Liste des Outils</h2>
    <span class="badge bg-secondary"><?php echo e(count($tools)); ?> outils</span>
</div>

<div class="row">
    <?php $__currentLoopData = $tools; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $tool): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
    <div class="col-md-4 mb-4">
        <div class="card h-100">
            <?php if($tool->image): ?>
                <img src="/storage/<?php echo e($tool->image); ?>" class="card-img-top" alt="<?php echo e($tool->title); ?>" style="height: 200px; object-fit: cover;">
            <?php else: ?>
                <div class="bg-light text-center py-5" style="height: 200px;">Pas d'image</div>
            <?php endif; ?>
            <div class="card-body">
                <h5 class="card-title"><?php echo e($tool->title); ?></h5>
                <p class="card-text text-muted small"><?php echo e(Str::limit($tool->description, 100)); ?></p>
                <div class="d-flex justify-content-between">
                    <span class="fw-bold"><?php echo e($tool->price); ?> DH/jour</span>
                    <span class="badge bg-info text-dark"><?php echo e($tool->category->name); ?></span>
                </div>
            </div>
            <div class="card-footer bg-white border-top-0">
                <small class="text-muted">Propriétaire: <?php echo e($tool->user->name); ?></small>
            </div>
        </div>
    </div>
    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH C:\Users\user\Documents\laravel\tasharuk-full\backend\resources\views/admin/tools.blade.php ENDPATH**/ ?>