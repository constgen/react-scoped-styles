import { createDirHash } from './lib/dirhash';
import { LoaderContext } from './options';

export default function scriptLoader(this: LoaderContext, source: string): string {
    const { globalsPrefix = 'app' } = this.query;
    const isExternal = !this.resourcePath.startsWith(this.rootContext);

    const classExprRegex = /classname:\s(["'].*?["']|.*?\))/gi;
    const classStringRegex = new RegExp(`['|"](.*?)['|"]`, 'g')

    if (isExternal || !source.match(classExprRegex)) {
        return source;
    }

    const [dirName, dirHash] = createDirHash(this.context);

    return source.replace(classExprRegex, classExpr => {
        return classExpr.replace(classStringRegex, (_match, classNames) => {
            const uniqueClassNames = classNames.split(' ')
                .map((className: string) => {
                    const uniquePrefix = `${dirName}-${dirHash}`
                    const uniqueClassName = `${uniquePrefix}-${className}`;
                    const containsPrefix = className.startsWith(`${globalsPrefix}-`);
                    const hasUniqueName = className.startsWith(uniquePrefix);
                    const needsUniqueName = !(containsPrefix || hasUniqueName);

                    return needsUniqueName ? uniqueClassName : className;
                })
                .join(' ');

            return "'" + uniqueClassNames + "'";
        });
    });
}