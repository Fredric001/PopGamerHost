document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('deployForm');
    const deployBtn = document.getElementById('deployBtn');
    const statusMessage = document.getElementById('statusMessage');
    const deployCard = document.getElementById('deployCard');
    const successCard = document.getElementById('successCard');
    const liveLink = document.getElementById('liveLink');
    const nameInput = document.getElementById('studentName');
    const urlPreview = document.getElementById('urlPreview');

    // Real-time URL preview
    nameInput.addEventListener('input', (e) => {
        let val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        e.target.value = val; // Enforce sanitization in UI
        const slug = val || 'guest';
        urlPreview.textContent = `/sites/${slug}-xxxxx`;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const htmlContent = document.getElementById('htmlInput').value;
        const cssContent = document.getElementById('cssInput').value;
        const jsContent = document.getElementById('jsInput').value;
        const studentName = nameInput.value;

        if (!htmlContent.trim()) {
            showError('⚠️ Oops! You need to paste some HTML code first.');
            return;
        }

        // Start Loading State
        setLoading(true);
        hideError();

        try {
            const response = await fetch('https://popgamerhost.onrender.com/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    html: htmlContent,
                    css: cssContent,
                    js: jsContent,
                    studentName: studentName
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Success Transition
                showSuccess(data.url);
            } else {
                throw new Error(data.error || 'Something went wrong with the deployment.');
            }
        } catch (error) {
            showError(`😔 Deployment failed: ${error.message}`);
        } finally {
            if (document.getElementById('successCard').style.display !== 'block') {
                setLoading(false);
            }
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            deployBtn.disabled = true;
            deployBtn.innerHTML = '<span class="spinner"></span> Deploying your site...';
        } else {
            deployBtn.disabled = false;
            deployBtn.innerHTML = '🚀 Deploy my website';
        }
    }

    function showError(msg) {
        statusMessage.textContent = msg;
        statusMessage.className = 'message error';
        statusMessage.style.display = 'block';
    }

    function hideError() {
        statusMessage.style.display = 'none';
    }

    function showSuccess(url) {
        deployCard.style.display = 'none';
        successCard.classList.add('visible');
        liveLink.href = url;

        // Populate Share UI
        const shareUrlInput = document.getElementById('shareUrlInput');
        const openSiteBtn = document.getElementById('openSiteBtn');
        const qrCodeImg = document.getElementById('qrCodeImg');

        if (shareUrlInput) shareUrlInput.value = url;
        if (openSiteBtn) openSiteBtn.href = url;
        
        // Generate QR Code
        if (qrCodeImg) {
            qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
            qrCodeImg.style.display = 'inline-block';
        }
    }

    // Share Suite Logic
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const smsBtn = document.getElementById('smsBtn');
    const smsInput = document.getElementById('smsNumber');

    // 1. Copy Link
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const url = document.getElementById('shareUrlInput').value;
            navigator.clipboard.writeText(url).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied ✅';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    }

    // 2. Download Link (.txt)
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const url = document.getElementById('shareUrlInput').value;
            const textContent = `My Deployed Website:\n${url}\n\nDeployed via Instant Site Deployer`;
            const blob = new Blob([textContent], { type: 'text/plain' });
            const anchor = document.createElement('a');
            anchor.href = URL.createObjectURL(blob);
            anchor.download = 'my-site-link.txt';
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
        });
    }

    // 3. SMS Share
    if (smsBtn && smsInput) {
        smsBtn.addEventListener('click', () => {
            const phone = smsInput.value.replace(/[^0-9+]/g, '');
            const url = document.getElementById('shareUrlInput').value;
            const message = `Check out my new website! ${url}`;
            
            // Allow empty phone for generic SMS trigger
            const smsLink = `sms:${phone}?body=${encodeURIComponent(message)}`;
            window.open(smsLink, '_blank');
        });
    }
});
