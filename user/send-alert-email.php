<?php
require 'vendor/autoload.php';
require 'config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data']);
    exit;
}

// Create email body
$body = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4a90e2; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .section { margin: 20px 0; }
        .section-title { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .list { margin: 10px 0; padding-left: 20px; }
        .list li { margin: 5px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Disaster Alert</h1>
        </div>
        <div class='content'>
            <div class='alert'>
                <h2>Risk Assessment Alert</h2>
                <p>Type: {$data['content']['disasterType']}</p>
                <p>Risk Score: " . ($data['content']['riskScore'] * 100) . "%</p>
            </div>

            <div class='section'>
                <h3 class='section-title'>Current Weather Conditions</h3>
                <ul class='list'>
                    <li>Temperature: {$data['content']['currentWeather']['temperature']}°C</li>
                    <li>Precipitation: {$data['content']['currentWeather']['precipitation']} mm</li>
                    <li>Wind Speed: {$data['content']['currentWeather']['windspeed_kph']} km/h</li>
                    <li>Humidity: {$data['content']['currentWeather']['humidity']}%</li>
                </ul>
            </div>

            <div class='section'>
                <h3 class='section-title'>Risk Analysis</h3>
                <ul class='list'>";
                foreach ($data['content']['analysis'] as $point) {
                    $body .= "<li>$point</li>";
                }
$body .= "
                </ul>
            </div>

            <div class='section'>
                <h3 class='section-title'>Recommended Precautions</h3>
                <ul class='list'>";
                foreach ($data['content']['precautions'] as $precaution) {
                    $body .= "<li>$precaution</li>";
                }
$body .= "
                </ul>
            </div>
        </div>
        <div class='footer'>
            <p>This is an automated alert from Disaster Intelligence System</p>
            <p>Please take necessary precautions and stay safe.</p>
        </div>
    </div>
</body>
</html>
";

try {
    $mail = new PHPMailer(true);

    // Server settings
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USERNAME;
    $mail->Password = SMTP_PASSWORD;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = SMTP_PORT;

    // Recipients
    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    $mail->addAddress($data['to']);

    // Content
    $mail->isHTML(true);
    $mail->Subject = $data['subject'];
    $mail->Body = $body;

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email: ' . $mail->ErrorInfo]);
}
?> 