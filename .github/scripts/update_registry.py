import os
import json

def update_registry():
    projects_dir = 'assets/projects'
    registry_path = os.path.join(projects_dir, 'registry.json')
    
    registry = []
    
    if not os.path.exists(projects_dir):
        os.makedirs(projects_dir)

    # Folders to ignore
    ignore = ['.git', 'registry.json']
    
    for project_id in sorted(os.listdir(projects_dir)):
        if project_id in ignore:
            continue
            
        path = os.path.join(projects_dir, project_id)
        if os.path.isdir(path):
            # Default values
            project_data = {
                "id": project_id,
                "title": project_id.replace('-', ' ').title(),
                "description": "",
                "year": "",
                "location": "Agra, India",
                "has360": os.path.exists(os.path.join(path, "360")),
                "thumbnail": "panorama.jpg" if os.path.exists(os.path.join(path, "panorama.jpg")) else "preview.jpg"
            }
            
            # Check for a local info.json
            info_path = os.path.join(path, 'info.json')
            if os.path.exists(info_path):
                try:
                    with open(info_path, 'r') as f:
                        info = json.load(f)
                        project_data.update(info)
                except:
                    pass
            
            # Check for extra gallery images in Images/ subfolder
            images_dir = os.path.join(path, 'Images')
            if os.path.exists(images_dir) and os.path.isdir(images_dir):
                valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
                images = [f for f in sorted(os.listdir(images_dir)) if f.lower().endswith(valid_extensions)]
                project_data['images'] = [os.path.join('Images', img) for img in images]
            else:
                project_data['images'] = []
            
            registry.append(project_data)
            
    with open(registry_path, 'w') as f:
        json.dump(registry, f, indent=2)

if __name__ == "__main__":
    update_registry()
