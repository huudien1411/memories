document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // =========================================================
    // 🛑 CÀI ĐẶT 2 ĐƯỜNG LINK GOOGLE APPS SCRIPT CỦA BẠN VÀO ĐÂY
    // =========================================================
    
    // 1. Link GAS chuyên lưu ĐIỀU ƯỚC (Wish)
    const WISH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzhQ72XeK3I4IgIQ5fe7UXKrAdIhZ1EAy2K7t7M1UfOwoHu_D4c0dAhTJ848j99aFVpkA/exec';

    // 2. Link GAS chuyên tải và lưu KỶ NIỆM (Memory + Drive)
    const MEMORY_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUHP17h9-LTpwNMKwerbYKQirv_Kie2M0rTIVIA5LymHhtWkldx3D-Eve5I7UamqFq/exec';

    // =========================================================


    // ========= TAB =========
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.tab;

            tabButtons.forEach((btn) => btn.classList.remove('active'));
            tabPanels.forEach((panel) => panel.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(targetId)?.classList.add('active');
        });
    });

    // ========= SPARKLE CURSOR =========
    const sparkleIcons = ['✨', '♡', '✦', '🦋', '💫', '🌸', '⋆', '💖'];

    function createSpark(x, y, burst = false) {
        if (reducedMotion) return;

        const spark = document.createElement('span');
        spark.className = 'cursor-spark';
        spark.textContent = sparkleIcons[Math.floor(Math.random() * sparkleIcons.length)];
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.setProperty('--move-x', `${(Math.random() - 0.5) * (burst ? 145 : 52)}px`);
        spark.style.fontSize = burst
            ? `${1 + Math.random() * 0.9}rem`
            : `${0.78 + Math.random() * 0.48}rem`;

        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 1500);
    }

    function sparkleTrail(event) {
        if (reducedMotion) return;
        if (Math.random() > 0.12) return;

        const point = event.touches ? event.touches[0] : event;
        createSpark(
            point.clientX + (Math.random() - 0.5) * 16,
            point.clientY + (Math.random() - 0.5) * 10
        );
    }

    document.addEventListener('mousemove', sparkleTrail, { passive: true });
    document.addEventListener('touchmove', sparkleTrail, { passive: true });

    function burstFromElement(element, amount = 18) {
        if (reducedMotion || !element) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < amount; i += 1) {
            setTimeout(() => {
                createSpark(
                    centerX + (Math.random() - 0.5) * 120,
                    centerY + (Math.random() - 0.5) * 56,
                    true
                );
            }, i * 55);
        }
    }


    // ========= LUỒNG 1: WISH FORM (GỬI LÊN LINK ĐIỀU ƯỚC) =========
    const wishForm = document.getElementById('wishForm');
    const submitBtn = document.getElementById('submitBtn');
    const notification = document.getElementById('notification');

    let isSubmitting = false;
    let wishNoticeTimeout = null;

    function showNotice(el, message, type = 'success') {
        clearTimeout(wishNoticeTimeout);
        el.textContent = message;
        el.style.color = type === 'success' ? '#8b4a63' : '#c2410c';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';

        wishNoticeTimeout = setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(8px)';
            setTimeout(() => {
                el.textContent = '';
            }, 300);
        }, 4200);
    }

    function updateWishButton(text, icon) {
        const textEl = submitBtn.querySelector('.btn-text');
        const iconEl = submitBtn.querySelector('.btn-icon');
        if (textEl) textEl.textContent = text;
        if (iconEl) iconEl.textContent = icon;
    }

    if (wishForm) {
        wishForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (isSubmitting) return;

            if (!WISH_SCRIPT_URL || WISH_SCRIPT_URL.includes('DÁN_LINK')) {
                showNotice(notification, 'Bạn chưa gắn link lưu Điều ước vào file code.', 'error');
                return;
            }

            isSubmitting = true;
            submitBtn.disabled = true;
            updateWishButton('Đang gửi điều ước', '✦');

            try {
                await fetch(WISH_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors', 
                    body: new FormData(wishForm)
                });

                wishForm.reset();
                burstFromElement(submitBtn, 20);
                showNotice(notification, 'Điều ước của bạn đã được gửi đi thật dịu dàng rồi ✨', 'success');
            } catch (error) {
                console.error('Lỗi gửi form:', error);
                showNotice(notification, 'Có lỗi khi gửi dữ liệu. Thử lại sau nhé.', 'error');
            } finally {
                setTimeout(() => {
                    submitBtn.disabled = false;
                    updateWishButton('Gửi vào vũ trụ', '➜');
                    isSubmitting = false;
                }, 900);
            }
        });
    }


    // ========= LUỒNG 2: MEMORY ROOM (GỬI LÊN LINK KỶ NIỆM) =========
    const memoryForm = document.getElementById('memoryForm');
    const memoryWall = document.getElementById('memoryWall');
    const memoryNotice = document.getElementById('memoryNotice');
    const clearMemoriesBtn = document.getElementById('clearMemoriesBtn');
    const memoryImageFile = document.getElementById('memoryImageFile');
    const memoryImageUrl = document.getElementById('memoryImageUrl');
    const imagePreviewBox = document.getElementById('imagePreviewBox');
    const imagePreview = document.getElementById('imagePreview');

    const memoryTitle = document.getElementById('memoryTitle');
    const memoryDate = document.getElementById('memoryDate');
    const memoryDesc = document.getElementById('memoryDesc');

    let currentUploadedImage = '';
    let isMemorySubmitting = false;

    function formatDate(dateString) {
        if (!dateString) return 'Chưa ghi ngày';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showMemoryNotice(message, type = 'success') {
        memoryNotice.textContent = message;
        memoryNotice.style.color = type === 'success' ? '#8b4a63' : '#c2410c';
        memoryNotice.style.opacity = '1';
        memoryNotice.style.transform = 'translateY(0)';

        setTimeout(() => {
            memoryNotice.style.opacity = '0';
            memoryNotice.style.transform = 'translateY(8px)';
            setTimeout(() => { memoryNotice.textContent = ''; }, 300);
        }, 3600);
    }

    function updatePreview(src) {
        if (!src) {
            imagePreviewBox.classList.add('hidden');
            imagePreview.removeAttribute('src');
            return;
        }
        imagePreview.src = src;
        imagePreviewBox.classList.remove('hidden');
    }

    // Xử lý xem trước ảnh
    memoryImageFile?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            currentUploadedImage = '';
            if (!memoryImageUrl.value.trim()) updatePreview('');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            currentUploadedImage = reader.result;
            if (!memoryImageUrl.value.trim()) {
                updatePreview(currentUploadedImage);
            }
        };
        reader.readAsDataURL(file);
    });

    memoryImageUrl?.addEventListener('input', () => {
        const value = memoryImageUrl.value.trim();
        if (value) {
            updatePreview(value);
        } else if (currentUploadedImage) {
            updatePreview(currentUploadedImage);
        } else {
            updatePreview('');
        }
    });

    // 1. Tải dữ liệu từ Google Sheets hiển thị lên Memory Wall
    async function loadMemories() {
        if (!MEMORY_SCRIPT_URL || MEMORY_SCRIPT_URL.includes('DÁN_LINK')) return;
        
        memoryWall.innerHTML = '<div class="empty-memory">Đang tải kỷ niệm từ vũ trụ... 💫</div>';
        
        try {
            const response = await fetch(MEMORY_SCRIPT_URL);
            const memories = await response.json();

            if (!memories || memories.length === 0) {
                memoryWall.innerHTML = `
                    <div class="empty-memory">
                        Chưa có kỷ niệm nào ở đây cả. Hãy thêm một điều thật đáng yêu đầu tiên nhé ♡
                    </div>
                `;
                return;
            }

            memoryWall.innerHTML = memories.map((memory) => {
                const imagePart = memory.image
                    ? `<img class="memory-thumb" src="${memory.image}" alt="${escapeHtml(memory.title)}">`
                    : '';

                return `
                    <article class="memory-card">
                        ${imagePart}
                        <div class="memory-body">
                            <span class="memory-date">${escapeHtml(formatDate(memory.date))}</span>
                            <h4 class="memory-title">${escapeHtml(memory.title)}</h4>
                            <p class="memory-desc">${escapeHtml(memory.desc)}</p>
                        </div>
                    </article>
                `;
            }).join('');
            
        } catch (error) {
            console.error('Lỗi tải Memory:', error);
            memoryWall.innerHTML = '<div class="empty-memory" style="color: #c2410c;">Không thể kết nối với vũ trụ kỷ niệm. Hãy thử tải lại trang nhé.</div>';
        }
    }

    // 2. Gửi dữ liệu và ảnh lên Google Apps Script
    memoryForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isMemorySubmitting) return;

        if (!MEMORY_SCRIPT_URL || MEMORY_SCRIPT_URL.includes('DÁN_LINK')) {
            showMemoryNotice('Bạn chưa gắn link lưu Kỷ niệm vào file code.', 'error');
            return;
        }

        const title = memoryTitle.value.trim();
        const date = memoryDate.value;
        const desc = memoryDesc.value.trim();
        const imageUrl = memoryImageUrl.value.trim();

        if (!title || !desc) {
            showMemoryNotice('Bạn hãy nhập tên kỷ niệm và nội dung trước nhé.', 'error');
            return;
        }

        isMemorySubmitting = true;
        const submitMemBtn = memoryForm.querySelector('.alt-btn');
        submitMemBtn.style.opacity = '0.7';
        submitMemBtn.querySelector('span:nth-child(2)').textContent = 'Đang lưu kỷ niệm...';

        // Đóng gói dữ liệu
        const formData = new FormData();
        formData.append('memoryTitle', title);
        formData.append('memoryDate', date);
        formData.append('memoryDesc', desc);
        formData.append('memoryImageUrl', imageUrl);
        formData.append('imageFile', currentUploadedImage);

        try {
            await fetch(MEMORY_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });

            // Gửi xong thì reset form
            memoryForm.reset();
            currentUploadedImage = '';
            updatePreview('');
            
            burstFromElement(submitMemBtn, 16);
            showMemoryNotice('Đã thêm một kỷ niệm mới vào Memory Room rồi ♡', 'success');
            
            // Đợi Google Sheets kịp lưu rồi tải lại
            setTimeout(() => loadMemories(), 1500);
            
        } catch (error) {
            console.error('Lỗi lưu Memory:', error);
            showMemoryNotice('Có lỗi khi lưu kỷ niệm. Hãy thử lại sau.', 'error');
        } finally {
            isMemorySubmitting = false;
            submitMemBtn.style.opacity = '1';
            submitMemBtn.querySelector('span:nth-child(2)').textContent = 'Thêm vào phòng kỷ niệm';
        }
    });

    // 3. Nút xóa 
    clearMemoriesBtn?.addEventListener('click', () => {
        alert("Vì dữ liệu đã được lưu an toàn trên Google Sheets. Để xóa kỷ niệm, bạn vui lòng truy cập trực tiếp vào file Google Sheets nhé ♡");
    });

    // Chạy hàm tải dữ liệu ngay khi web load xong
    loadMemories();
});