import struct
import cv2
import numpy as np
import os
import shutil

def create_xtf_from_image(image_path, output_xtf_path, frequency_hz=455000.0):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise FileNotFoundError(f"Could not load image: {image_path}")

    # Standardize to 1024 width (512 port, 512 starboard)
    h, w = img.shape
    port_samples = 512
    stbd_samples = 512
    total_w = port_samples + stbd_samples

    img_resized = cv2.resize(img, (total_w, h), interpolation=cv2.INTER_AREA)

    with open(output_xtf_path, 'wb') as f:
        # --- 1. XTF FILE HEADER (1024 bytes) ---
        file_header = bytearray(1024)
        
        # Byte 0: FileFormat (0x7B = 123)
        file_header[0] = 0x7B
        # Byte 1: SystemType (1 = Klein / Edgetech standard SSS)
        file_header[1] = 1
        
        # RecordingProgramName (8 bytes)
        file_header[2:10] = b'SEATRACE'
        # RecordingProgramVersion (8 bytes)
        file_header[10:18] = b'1.00    '
        # SonarName (16 bytes)
        file_header[18:34] = b'MoES AUV SSS    '
        # SonarType (short at offset 34)
        struct.pack_into('<H', file_header, 34, 1)
        
        # Note (64 bytes at offset 36)
        note = b'SeaTrace Autonomous Marine Debris Sonar Transect (SIH 2026)'
        file_header[36:36+len(note)] = note
        
        # ThisFileName (64 bytes at offset 100)
        filename = os.path.basename(output_xtf_path).encode('utf-8')[:63]
        file_header[100:100+len(filename)] = filename
        
        # NavUnits (offset 164: 3 = Lat/Long degrees)
        struct.pack_into('<H', file_header, 164, 3)
        # NumberOfSonarChannels (offset 166: 2 = Port + Starboard)
        struct.pack_into('<H', file_header, 166, 2)
        
        # Channel 0 Info: Port (offset 192, 128 bytes)
        c0 = 192
        file_header[c0] = 2 # TypeOfChannel: 2 = Port Sidescan
        file_header[c0+1] = 0 # SubChannelNumber
        struct.pack_into('<H', file_header, c0+6, 0) # SampleFormat: 0 = 8-bit unsigned char
        struct.pack_into('<H', file_header, c0+8, 1) # BytesPerSample: 1
        file_header[c0+20:c0+36] = b'Port Sidescan   '
        struct.pack_into('<f', file_header, c0+36, 1.0) # VoltScale
        struct.pack_into('<f', file_header, c0+40, float(frequency_hz)) # Frequency
        
        # Channel 1 Info: Starboard (offset 192 + 128 = 320, 128 bytes)
        c1 = 320
        file_header[c1] = 3 # TypeOfChannel: 3 = Starboard Sidescan
        file_header[c1+1] = 1 # SubChannelNumber
        struct.pack_into('<H', file_header, c1+6, 0) # SampleFormat: 0 = 8-bit unsigned char
        struct.pack_into('<H', file_header, c1+8, 1) # BytesPerSample: 1
        file_header[c1+20:c1+36] = b'Starboard SSS   '
        struct.pack_into('<f', file_header, c1+36, 1.0) # VoltScale
        struct.pack_into('<f', file_header, c1+40, float(frequency_hz)) # Frequency
        
        f.write(file_header)
        
        # --- 2. PING RECORDS (One per image row) ---
        # Each ping record has:
        # XTFPingHeader (256 bytes)
        # + XTFPingChanHeader Port (64 bytes) + port_samples bytes
        # + XTFPingChanHeader Starboard (64 bytes) + stbd_samples bytes
        
        bytes_per_record = 256 + 2 * 64 + port_samples + stbd_samples
        
        for y in range(h):
            ping_header = bytearray(256)
            
            # MagicNumber (offset 0: 0xFACE = 64206)
            struct.pack_into('<H', ping_header, 0, 0xFACE)
            # HeaderType (offset 2: 0 = XTFPingHeader)
            ping_header[2] = 0
            # SubChannelNumber (offset 3: 0)
            ping_header[3] = 0
            # NumChansToFollow (offset 4: 2)
            struct.pack_into('<H', ping_header, 4, 2)
            # NumBytesThisRecord (offset 10: unsigned int)
            struct.pack_into('<I', ping_header, 10, bytes_per_record)
            
            # Date/Time
            struct.pack_into('<H', ping_header, 14, 2026) # Year
            ping_header[16] = 9 # Month
            ping_header[17] = 7 # Day
            ping_header[18] = 11 # Hour
            ping_header[19] = 45 # Minute
            ping_header[20] = (y % 60) # Second
            ping_header[21] = ((y * 10) % 100) # HSeconds
            struct.pack_into('<H', ping_header, 22, 250) # JulianDay
            
            # PingNumber (offset 32)
            struct.pack_into('<I', ping_header, 32, y + 1)
            # SonarSpeed (offset 36: knots)
            struct.pack_into('<f', ping_header, 36, 3.2)
            # SonarAltitude (offset 44: meters)
            struct.pack_into('<f', ping_header, 44, 3.5)
            # SonarDepth (offset 48: meters)
            struct.pack_into('<f', ping_header, 48, 48.2)
            # SensorHeading (offset 56: degrees)
            struct.pack_into('<f', ping_header, 56, 42.0)
            
            # Coordinates (SensorX=Long, SensorY=Lat)
            lat = 10.5700 + y * 0.00002
            lon = 72.6380 + y * 0.00001
            struct.pack_into('<d', ping_header, 80, lat)
            struct.pack_into('<d', ping_header, 88, lon)
            
            f.write(ping_header)
            
            # Port Channel Header (64 bytes)
            port_chan_hdr = bytearray(64)
            struct.pack_into('<H', port_chan_hdr, 0, 0) # ChannelNum = 0
            struct.pack_into('<f', port_chan_hdr, 4, 50.0) # SlantRange = 50m
            struct.pack_into('<f', port_chan_hdr, 8, 49.8) # GroundRange
            struct.pack_into('<I', port_chan_hdr, 36, port_samples) # NumSamples
            f.write(port_chan_hdr)
            
            # Port samples: left half of image row (reversed from center to edge in SSS standard)
            port_data = img_resized[y, :port_samples][::-1].tobytes()
            f.write(port_data)
            
            # Starboard Channel Header (64 bytes)
            stbd_chan_hdr = bytearray(64)
            struct.pack_into('<H', stbd_chan_hdr, 0, 1) # ChannelNum = 1
            struct.pack_into('<f', stbd_chan_hdr, 4, 50.0) # SlantRange = 50m
            struct.pack_into('<f', stbd_chan_hdr, 8, 49.8) # GroundRange
            struct.pack_into('<I', stbd_chan_hdr, 36, stbd_samples) # NumSamples
            f.write(stbd_chan_hdr)
            
            # Starboard samples: right half of image row (center to right edge)
            stbd_data = img_resized[y, port_samples:].tobytes()
            f.write(stbd_data)

    size_mb = round(os.path.getsize(output_xtf_path) / (1024 * 1024), 2)
    print(f"XTF successfully created at: {output_xtf_path} ({size_mb} MB)")
    return output_xtf_path

if __name__ == '__main__':
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    img_src = os.path.join(base_dir, 'real_world_sonar_test.png')
    
    xtf_out1 = os.path.join(base_dir, 'real_world_sonar_test.xtf')
    xtf_out2 = os.path.join(base_dir, 'transect_survey_alpha_455khz.xtf')
    
    create_xtf_from_image(img_src, xtf_out1)
    create_xtf_from_image(img_src, xtf_out2)
    
    # Copy to frontend public and dist downloads
    pub_dir = os.path.join(base_dir, 'marine-ai', 'frontend', 'public', 'downloads')
    dist_dir = os.path.join(base_dir, 'marine-ai', 'frontend', 'dist', 'downloads')
    
    for d in [pub_dir, dist_dir]:
        if os.path.exists(d):
            shutil.copy2(xtf_out1, d)
            shutil.copy2(xtf_out2, d)
            print(f"Copied XTF files to: {d}")
