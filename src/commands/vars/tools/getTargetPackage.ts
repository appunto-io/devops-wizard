import Package from '../../../model/Package';
import Project from '../../../model/Project';
import DowError from '../../../model/DowError';


const getTargetPackage = (targetPackage : string) : Package => {
  let pkg : Package;
  if(targetPackage) {
    const project = new Project();

    if(!project.isValid) {
      throw new DowError('Option --package was used outside of a project folder.')
    }

    const selectedPackage : Package | null = project.getPackage(targetPackage);

    if(!selectedPackage) {
      throw new DowError(`Package ${targetPackage} was not found. Aborting.`);
    }

    pkg = selectedPackage;
  }
  else {
    pkg = new Package();
    pkg.findRoot();
  }

  return pkg;
}

export default getTargetPackage;
